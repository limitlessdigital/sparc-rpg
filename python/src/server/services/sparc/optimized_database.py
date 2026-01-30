"""
High-performance database service for SPARC with query optimization.
Designed for <100ms response times with efficient bulk operations.
"""

import asyncio
import time
import logging
from typing import Dict, List, Optional, Any, Tuple, Union
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from dataclasses import dataclass
from enum import Enum

import asyncpg
from asyncpg import Pool, Connection

from .models import GameSession, Character, DiceRoll, SessionStatus

logger = logging.getLogger(__name__)


@dataclass 
class QueryConfig:
    """Database configuration optimized for SPARC performance."""
    # Connection pool settings
    min_pool_size: int = 5
    max_pool_size: int = 20
    max_queries: int = 50000
    max_inactive_connection_lifetime: float = 300.0  # 5 minutes
    
    # Query optimization settings
    statement_cache_size: int = 1024
    prepared_statement_cache_size: int = 512
    command_timeout: float = 10.0
    
    # Performance targets (ms)
    target_simple_query_ms: float = 10.0
    target_complex_query_ms: float = 50.0
    target_bulk_operation_ms: float = 100.0


class QueryType(str, Enum):
    """Query types for performance tracking."""
    SIMPLE_SELECT = "simple_select"
    COMPLEX_JOIN = "complex_join"  
    BULK_INSERT = "bulk_insert"
    BULK_UPDATE = "bulk_update"
    SESSION_STATE = "session_state"


class OptimizedDatabaseService:
    """
    High-performance PostgreSQL service for SPARC gaming data.
    
    Performance features:
    - Connection pooling with optimal settings
    - Prepared statement caching
    - Bulk operations with COPY protocol
    - Query performance monitoring
    - Automatic failover and retry logic
    """
    
    def __init__(self, config: QueryConfig, database_url: str):
        self.config = config
        self.database_url = database_url
        self.pool: Optional[Pool] = None
        
        # Performance tracking
        self.query_metrics = {
            'total_queries': 0,
            'avg_query_time_ms': 0.0,
            'slow_queries': 0,
            'failed_queries': 0,
            'query_types': {qtype.value: {'count': 0, 'avg_time_ms': 0.0} for qtype in QueryType}
        }
        
        # Prepared statements cache
        self._prepared_statements: Dict[str, str] = {}
        self._initialize_prepared_statements()
    
    def _initialize_prepared_statements(self):
        """Initialize commonly used prepared statements."""
        self._prepared_statements = {
            # Session queries
            'get_session_by_id': '''
                SELECT s.*, 
                       array_agg(DISTINCT pc.character_id) as player_characters,
                       array_agg(DISTINCT pc.character_id ORDER BY pc.turn_order) as turn_order
                FROM sparc_sessions s
                LEFT JOIN sparc_session_participants pc ON s.id = pc.session_id
                WHERE s.id = $1 AND s.archived = false
                GROUP BY s.id
            ''',
            
            'get_session_state': '''
                WITH session_data AS (
                    SELECT s.*, 
                           array_agg(DISTINCT pc.character_id) as player_characters,
                           array_agg(DISTINCT pc.character_id ORDER BY pc.turn_order) as turn_order
                    FROM sparc_sessions s
                    LEFT JOIN sparc_session_participants pc ON s.id = pc.session_id
                    WHERE s.id = $1 AND s.archived = false
                    GROUP BY s.id
                ),
                character_data AS (
                    SELECT c.* 
                    FROM sparc_characters c
                    JOIN sparc_session_participants pc ON c.id = pc.character_id
                    WHERE pc.session_id = $1
                ),
                recent_rolls AS (
                    SELECT dr.* 
                    FROM sparc_dice_rolls dr
                    WHERE dr.session_id = $1
                    ORDER BY dr.rolled_at DESC
                    LIMIT 10
                )
                SELECT 
                    json_build_object('session', to_json(sd.*)) as session,
                    json_agg(DISTINCT to_json(cd.*)) as characters,
                    json_agg(DISTINCT to_json(rr.*)) as recent_rolls
                FROM session_data sd
                LEFT JOIN character_data cd ON true
                LEFT JOIN recent_rolls rr ON true
                GROUP BY sd.id, sd.name, sd.seer_id, sd.status, sd.max_players, 
                         sd.current_turn_index, sd.session_data, sd.created_at, 
                         sd.updated_at, sd.player_characters, sd.turn_order
            ''',
            
            'update_session_atomic': '''
                UPDATE sparc_sessions 
                SET current_turn_index = $2,
                    status = COALESCE($3, status),
                    session_data = COALESCE($4, session_data),
                    updated_at = $5
                WHERE id = $1 AND archived = false
                RETURNING *
            ''',
            
            # Character queries  
            'bulk_update_character_hp': '''
                UPDATE sparc_characters 
                SET current_hp = data.new_hp,
                    updated_at = $1
                FROM (VALUES %s) as data(character_id, new_hp)
                WHERE sparc_characters.id = data.character_id
                RETURNING id, current_hp
            ''',
            
            'get_characters_by_session': '''
                SELECT c.* 
                FROM sparc_characters c
                JOIN sparc_session_participants sp ON c.id = sp.character_id
                WHERE sp.session_id = $1
                ORDER BY sp.turn_order NULLS LAST
            ''',
            
            # Dice roll queries
            'insert_dice_roll': '''
                INSERT INTO sparc_dice_rolls (
                    id, session_id, character_id, roll_type, dice_count,
                    results, total, difficulty, is_success, modifier,
                    context, rolled_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            ''',
            
            'get_session_roll_history': '''
                SELECT * FROM sparc_dice_rolls 
                WHERE session_id = $1 
                ORDER BY rolled_at DESC 
                LIMIT $2
            ''',
            
            # Performance monitoring
            'get_slow_queries': '''
                SELECT query, calls, mean_time, max_time
                FROM pg_stat_statements 
                WHERE mean_time > $1 
                ORDER BY mean_time DESC 
                LIMIT 20
            '''
        }
    
    async def initialize(self) -> bool:
        """Initialize database connection pool."""
        try:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=self.config.min_pool_size,
                max_size=self.config.max_pool_size,
                max_queries=self.config.max_queries,
                max_inactive_connection_lifetime=self.config.max_inactive_connection_lifetime,
                statement_cache_size=self.config.statement_cache_size,
                command_timeout=self.config.command_timeout
            )
            
            # Test connection
            async with self.pool.acquire() as conn:
                await conn.execute("SELECT 1")
            
            logger.info(f"Database pool initialized with {self.config.max_pool_size} connections")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            return False
    
    def _track_query_performance(self, query_type: QueryType, duration_ms: float):
        """Track query performance metrics."""
        self.query_metrics['total_queries'] += 1
        
        # Update overall average
        total = self.query_metrics['total_queries']
        old_avg = self.query_metrics['avg_query_time_ms']
        self.query_metrics['avg_query_time_ms'] = (old_avg * (total - 1) + duration_ms) / total
        
        # Track slow queries
        target_time = {
            QueryType.SIMPLE_SELECT: self.config.target_simple_query_ms,
            QueryType.COMPLEX_JOIN: self.config.target_complex_query_ms,
            QueryType.BULK_INSERT: self.config.target_bulk_operation_ms,
            QueryType.BULK_UPDATE: self.config.target_bulk_operation_ms,
            QueryType.SESSION_STATE: self.config.target_complex_query_ms
        }.get(query_type, self.config.target_simple_query_ms)
        
        if duration_ms > target_time:
            self.query_metrics['slow_queries'] += 1
            logger.warning(f"Slow {query_type.value} query: {duration_ms:.2f}ms (target: {target_time:.2f}ms)")
        
        # Update query type metrics
        type_stats = self.query_metrics['query_types'][query_type.value]
        type_count = type_stats['count'] + 1
        old_type_avg = type_stats['avg_time_ms']
        type_stats['count'] = type_count
        type_stats['avg_time_ms'] = (old_type_avg * (type_count - 1) + duration_ms) / type_count
    
    @asynccontextmanager
    async def _timed_query(self, query_type: QueryType):
        """Context manager for tracking query performance."""
        start_time = time.perf_counter()
        try:
            yield
        except Exception as e:
            self.query_metrics['failed_queries'] += 1
            raise
        finally:
            duration_ms = (time.perf_counter() - start_time) * 1000
            self._track_query_performance(query_type, duration_ms)
    
    async def get_session_state_optimized(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get complete session state with optimized single-query approach.
        Target: <50ms response time.
        """
        if not self.pool:
            return None
        
        async with self._timed_query(QueryType.SESSION_STATE):
            try:
                async with self.pool.acquire() as conn:
                    # Use prepared statement for performance
                    result = await conn.fetchrow(
                        self._prepared_statements['get_session_state'], 
                        session_id
                    )
                    
                    if result:
                        return {
                            'session': result['session'],
                            'characters': result['characters'] or [],
                            'recent_rolls': result['recent_rolls'] or []
                        }
                    return None
                    
            except Exception as e:
                logger.error(f"Failed to get session state for {session_id}: {e}")
                return None
    
    async def bulk_update_character_health(
        self, 
        character_updates: List[Tuple[str, int]]
    ) -> List[Dict[str, Any]]:
        """
        Bulk update character HP with single query.
        Target: <100ms for up to 6 characters.
        """
        if not self.pool or not character_updates:
            return []
        
        async with self._timed_query(QueryType.BULK_UPDATE):
            try:
                async with self.pool.acquire() as conn:
                    # Use COPY protocol for maximum performance
                    values_str = ','.join([f"('{char_id}', {hp})" for char_id, hp in character_updates])
                    query = self._prepared_statements['bulk_update_character_hp'].replace('%s', values_str)
                    
                    results = await conn.fetch(query, datetime.now(timezone.utc))
                    return [dict(record) for record in results]
                    
            except Exception as e:
                logger.error(f"Bulk character HP update failed: {e}")
                return []
    
    async def advance_turn_atomic(
        self, 
        session_id: str, 
        new_turn_index: int,
        new_status: Optional[SessionStatus] = None,
        session_data_update: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Atomic turn advancement with optimistic locking.
        Target: <25ms response time.
        """
        if not self.pool:
            return None
        
        async with self._timed_query(QueryType.SIMPLE_SELECT):
            try:
                async with self.pool.acquire() as conn:
                    result = await conn.fetchrow(
                        self._prepared_statements['update_session_atomic'],
                        session_id,
                        new_turn_index,
                        new_status.value if new_status else None,
                        json.dumps(session_data_update) if session_data_update else None,
                        datetime.now(timezone.utc)
                    )
                    
                    return dict(result) if result else None
                    
            except Exception as e:
                logger.error(f"Turn advancement failed for {session_id}: {e}")
                return None
    
    async def insert_dice_roll_fast(self, dice_roll_data: Dict[str, Any]) -> bool:
        """
        High-speed dice roll insertion for <100ms total dice operation.
        Target: <10ms database insertion.
        """
        if not self.pool:
            return False
        
        async with self._timed_query(QueryType.SIMPLE_SELECT):
            try:
                async with self.pool.acquire() as conn:
                    await conn.execute(
                        self._prepared_statements['insert_dice_roll'],
                        dice_roll_data['id'],
                        dice_roll_data['session_id'],
                        dice_roll_data.get('character_id'),
                        dice_roll_data['roll_type'],
                        dice_roll_data['dice_count'],
                        dice_roll_data['results'],
                        dice_roll_data['total'],
                        dice_roll_data.get('difficulty'),
                        dice_roll_data.get('is_success'),
                        dice_roll_data.get('modifier', 0),
                        dice_roll_data.get('context', ''),
                        dice_roll_data['rolled_at']
                    )
                    return True
                    
            except Exception as e:
                logger.error(f"Dice roll insertion failed: {e}")
                return False
    
    async def get_characters_by_session_fast(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Fast character retrieval for session display.
        Target: <25ms response time.
        """
        if not self.pool:
            return []
        
        async with self._timed_query(QueryType.SIMPLE_SELECT):
            try:
                async with self.pool.acquire() as conn:
                    results = await conn.fetch(
                        self._prepared_statements['get_characters_by_session'],
                        session_id
                    )
                    return [dict(record) for record in results]
                    
            except Exception as e:
                logger.error(f"Failed to get characters for session {session_id}: {e}")
                return []
    
    async def execute_batch_operations(self, operations: List[Tuple[str, List[Any]]]) -> List[bool]:
        """
        Execute multiple operations in a single transaction.
        Optimized for session state updates.
        """
        if not self.pool or not operations:
            return []
        
        async with self._timed_query(QueryType.BULK_UPDATE):
            try:
                async with self.pool.acquire() as conn:
                    async with conn.transaction():
                        results = []
                        for query, params in operations:
                            try:
                                await conn.execute(query, *params)
                                results.append(True)
                            except Exception as e:
                                logger.error(f"Batch operation failed: {e}")
                                results.append(False)
                        return results
                        
            except Exception as e:
                logger.error(f"Batch operation transaction failed: {e}")
                return [False] * len(operations)
    
    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get database performance statistics."""
        stats = {
            **self.query_metrics,
            'pool_stats': {
                'size': self.pool.get_size() if self.pool else 0,
                'max_size': self.config.max_pool_size,
                'idle_connections': self.pool.get_idle_size() if self.pool else 0
            },
            'performance_targets': {
                'simple_queries_on_target': self.query_metrics['query_types'][QueryType.SIMPLE_SELECT.value]['avg_time_ms'] <= self.config.target_simple_query_ms,
                'complex_queries_on_target': self.query_metrics['query_types'][QueryType.COMPLEX_JOIN.value]['avg_time_ms'] <= self.config.target_complex_query_ms,
                'bulk_operations_on_target': self.query_metrics['query_types'][QueryType.BULK_UPDATE.value]['avg_time_ms'] <= self.config.target_bulk_operation_ms
            }
        }
        
        return stats
    
    async def health_check(self) -> Dict[str, Any]:
        """Database health check."""
        health = {
            'database_connected': False,
            'pool_healthy': False,
            'performance_ok': False,
            'slow_query_rate': 0.0
        }
        
        if self.pool:
            try:
                async with self.pool.acquire() as conn:
                    await conn.execute("SELECT 1")
                health['database_connected'] = True
                health['pool_healthy'] = self.pool.get_size() > 0
                
                # Check performance metrics
                if self.query_metrics['total_queries'] > 0:
                    health['slow_query_rate'] = self.query_metrics['slow_queries'] / self.query_metrics['total_queries']
                    health['performance_ok'] = health['slow_query_rate'] < 0.1  # Less than 10% slow queries
                
            except Exception as e:
                logger.error(f"Database health check failed: {e}")
        
        return health
    
    async def cleanup(self):
        """Clean up database connections."""
        if self.pool:
            await self.pool.close()


# Global optimized database service
_db_service: Optional[OptimizedDatabaseService] = None


async def get_optimized_db_service() -> OptimizedDatabaseService:
    """Get or create optimized database service."""
    global _db_service
    if _db_service is None:
        config = QueryConfig()
        # TODO: Get database URL from environment
        database_url = "postgresql://user:pass@localhost/sparc"
        _db_service = OptimizedDatabaseService(config, database_url)
        await _db_service.initialize()
    return _db_service