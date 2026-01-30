"""
SPARC Dice Roll History and Analytics Service

Provides persistent storage and analytics for dice rolls with efficient querying.
Integrates with Supabase for data persistence and real-time updates.
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import asyncpg
from collections import defaultdict

from .dice_engine import DiceRoll, DiceStatistics
from ..database_service import get_database_service

@dataclass
class RollAnalytics:
    """Analytics data for dice rolls."""
    session_id: str
    time_period: str
    total_rolls: int
    success_rate: float
    average_result: float
    most_common_roll_type: str
    character_performance: Dict[str, Dict]
    roll_distribution: Dict[int, int]
    performance_trends: List[Dict]

@dataclass
class SessionSummary:
    """Summary statistics for a game session."""
    session_id: str
    start_time: datetime
    end_time: Optional[datetime]
    total_rolls: int
    unique_characters: int
    average_success_rate: float
    most_active_character: str
    roll_type_breakdown: Dict[str, int]
    performance_metrics: Dict[str, float]

class DiceHistoryService:
    """Service for managing dice roll history and analytics."""
    
    def __init__(self):
        self.db_service = get_database_service()
        self._analytics_cache: Dict[str, RollAnalytics] = {}
        self._cache_ttl = 300  # 5 minutes
        self._last_cache_update: Dict[str, float] = {}
    
    async def store_dice_roll(self, dice_roll: DiceRoll) -> bool:
        """
        Store a dice roll in the database.
        
        Args:
            dice_roll: DiceRoll object to store
            
        Returns:
            True if stored successfully
        """
        try:
            await self.db_service.execute_query("""
                INSERT INTO dice_rolls (
                    id, session_id, character_id, roll_type, dice_count, dice_sides,
                    modifier, result, individual_rolls, difficulty, success,
                    timestamp, response_time_ms
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            """, [
                dice_roll.id,
                dice_roll.session_id,
                dice_roll.character_id,
                dice_roll.roll_type,
                dice_roll.dice_count,
                dice_roll.dice_sides,
                dice_roll.modifier,
                dice_roll.result,
                json.dumps(dice_roll.individual_rolls),
                dice_roll.difficulty,
                dice_roll.success,
                datetime.fromtimestamp(dice_roll.timestamp),
                dice_roll.response_time_ms
            ])
            
            # Invalidate analytics cache for this session
            if dice_roll.session_id in self._analytics_cache:
                del self._analytics_cache[dice_roll.session_id]
            
            return True
            
        except Exception as e:
            print(f"Failed to store dice roll {dice_roll.id}: {e}")
            return False
    
    async def get_recent_rolls(self, session_id: str, limit: int = 10) -> List[DiceRoll]:
        """Get recent dice rolls for a session from database."""
        try:
            results = await self.db_service.fetch_all("""
                SELECT * FROM dice_rolls 
                WHERE session_id = $1 
                ORDER BY timestamp DESC 
                LIMIT $2
            """, [session_id, limit])
            
            dice_rolls = []
            for row in results:
                dice_roll = DiceRoll(
                    id=row['id'],
                    session_id=row['session_id'],
                    character_id=row['character_id'],
                    roll_type=row['roll_type'],
                    dice_count=row['dice_count'],
                    dice_sides=row['dice_sides'],
                    modifier=row['modifier'],
                    result=row['result'],
                    individual_rolls=json.loads(row['individual_rolls']),
                    difficulty=row['difficulty'],
                    success=row['success'],
                    timestamp=row['timestamp'].timestamp(),
                    response_time_ms=row['response_time_ms']
                )
                dice_rolls.append(dice_roll)
            
            return dice_rolls
            
        except Exception as e:
            print(f"Failed to get recent rolls for session {session_id}: {e}")
            return []
    
    async def get_session_statistics(self, session_id: str) -> DiceStatistics:
        """Get comprehensive statistics for a session."""
        try:
            # Get basic statistics
            basic_stats = await self.db_service.fetch_one("""
                SELECT 
                    COUNT(*) as total_rolls,
                    AVG(result) as average_result,
                    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as success_rate,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
                    AVG(CASE WHEN response_time_ms < 100 THEN 1.0 ELSE 0.0 END) as sub_100ms_rate
                FROM dice_rolls 
                WHERE session_id = $1
            """, [session_id])
            
            # Get roll type breakdown
            roll_types = await self.db_service.fetch_all("""
                SELECT roll_type, COUNT(*) as count
                FROM dice_rolls 
                WHERE session_id = $1
                GROUP BY roll_type
                ORDER BY count DESC
            """, [session_id])
            
            common_roll_types = {row['roll_type']: row['count'] for row in roll_types}
            
            if basic_stats and basic_stats['total_rolls'] > 0:
                return DiceStatistics(
                    total_rolls=basic_stats['total_rolls'],
                    average_result=float(basic_stats['average_result'] or 0),
                    success_rate=float(basic_stats['success_rate'] or 0),
                    common_roll_types=common_roll_types,
                    performance_p95_ms=float(basic_stats['p95_response_time'] or 0),
                    sub_100ms_rate=float(basic_stats['sub_100ms_rate'] or 0)
                )
            else:
                return DiceStatistics(0, 0.0, 0.0, {}, 0.0, 0.0)
                
        except Exception as e:
            print(f"Failed to get session statistics for {session_id}: {e}")
            return DiceStatistics(0, 0.0, 0.0, {}, 0.0, 0.0)
    
    async def get_character_performance(self, character_id: str, 
                                      days: int = 30) -> Dict[str, Any]:
        """Get performance analytics for a specific character."""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            results = await self.db_service.fetch_one("""
                SELECT 
                    COUNT(*) as total_rolls,
                    AVG(result) as average_result,
                    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as success_rate,
                    MAX(result) as best_roll,
                    MIN(result) as worst_roll,
                    AVG(response_time_ms) as avg_response_time
                FROM dice_rolls 
                WHERE character_id = $1 AND timestamp > $2
            """, [character_id, cutoff_date])
            
            # Get roll type preferences
            roll_preferences = await self.db_service.fetch_all("""
                SELECT roll_type, COUNT(*) as count, AVG(result) as avg_result
                FROM dice_rolls 
                WHERE character_id = $1 AND timestamp > $2
                GROUP BY roll_type
                ORDER BY count DESC
            """, [character_id, cutoff_date])
            
            return {
                'character_id': character_id,
                'period_days': days,
                'total_rolls': results['total_rolls'] if results else 0,
                'average_result': float(results['average_result'] or 0),
                'success_rate': float(results['success_rate'] or 0),
                'best_roll': results['best_roll'] if results else 0,
                'worst_roll': results['worst_roll'] if results else 0,
                'avg_response_time': float(results['avg_response_time'] or 0),
                'roll_type_preferences': [
                    {
                        'type': row['roll_type'],
                        'count': row['count'],
                        'avg_result': float(row['avg_result'])
                    } for row in roll_preferences
                ]
            }
            
        except Exception as e:
            print(f"Failed to get character performance for {character_id}: {e}")
            return {'character_id': character_id, 'error': str(e)}
    
    async def get_roll_analytics(self, session_id: str, 
                               force_refresh: bool = False) -> RollAnalytics:
        """Get comprehensive analytics for a session with caching."""
        import time
        current_time = time.time()
        
        # Check cache first
        if (not force_refresh and 
            session_id in self._analytics_cache and
            session_id in self._last_cache_update and
            current_time - self._last_cache_update[session_id] < self._cache_ttl):
            return self._analytics_cache[session_id]
        
        try:
            # Get roll distribution
            distribution = await self.db_service.fetch_all("""
                SELECT result, COUNT(*) as count
                FROM dice_rolls 
                WHERE session_id = $1
                GROUP BY result
                ORDER BY result
            """, [session_id])
            
            roll_distribution = {row['result']: row['count'] for row in distribution}
            
            # Get character performance breakdown
            character_stats = await self.db_service.fetch_all("""
                SELECT 
                    character_id,
                    COUNT(*) as total_rolls,
                    AVG(result) as avg_result,
                    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as success_rate,
                    AVG(response_time_ms) as avg_response_time
                FROM dice_rolls 
                WHERE session_id = $1
                GROUP BY character_id
            """, [session_id])
            
            character_performance = {}
            for row in character_stats:
                character_performance[row['character_id']] = {
                    'total_rolls': row['total_rolls'],
                    'avg_result': float(row['avg_result']),
                    'success_rate': float(row['success_rate'] or 0),
                    'avg_response_time': float(row['avg_response_time'])
                }
            
            # Get performance trends (hourly buckets for last 24 hours)
            trend_data = await self.db_service.fetch_all("""
                SELECT 
                    DATE_TRUNC('hour', timestamp) as hour,
                    COUNT(*) as rolls,
                    AVG(response_time_ms) as avg_response_time,
                    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as success_rate
                FROM dice_rolls 
                WHERE session_id = $1 
                AND timestamp > NOW() - INTERVAL '24 hours'
                GROUP BY DATE_TRUNC('hour', timestamp)
                ORDER BY hour
            """, [session_id])
            
            performance_trends = []
            for row in trend_data:
                performance_trends.append({
                    'hour': row['hour'].isoformat(),
                    'rolls': row['rolls'],
                    'avg_response_time': float(row['avg_response_time']),
                    'success_rate': float(row['success_rate'] or 0)
                })
            
            # Get overall session stats
            session_stats = await self.get_session_statistics(session_id)
            most_common_type = max(session_stats.common_roll_types.items(), 
                                 key=lambda x: x[1])[0] if session_stats.common_roll_types else "general"
            
            analytics = RollAnalytics(
                session_id=session_id,
                time_period="session",
                total_rolls=session_stats.total_rolls,
                success_rate=session_stats.success_rate,
                average_result=session_stats.average_result,
                most_common_roll_type=most_common_type,
                character_performance=character_performance,
                roll_distribution=roll_distribution,
                performance_trends=performance_trends
            )
            
            # Cache the results
            self._analytics_cache[session_id] = analytics
            self._last_cache_update[session_id] = current_time
            
            return analytics
            
        except Exception as e:
            print(f"Failed to get roll analytics for session {session_id}: {e}")
            # Return empty analytics on error
            return RollAnalytics(
                session_id=session_id,
                time_period="session",
                total_rolls=0,
                success_rate=0.0,
                average_result=0.0,
                most_common_roll_type="general",
                character_performance={},
                roll_distribution={},
                performance_trends=[]
            )
    
    async def get_session_summary(self, session_id: str) -> SessionSummary:
        """Get a comprehensive summary of a game session."""
        try:
            # Get basic session info
            session_info = await self.db_service.fetch_one("""
                SELECT 
                    MIN(timestamp) as start_time,
                    MAX(timestamp) as end_time,
                    COUNT(*) as total_rolls,
                    COUNT(DISTINCT character_id) as unique_characters,
                    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as avg_success_rate
                FROM dice_rolls 
                WHERE session_id = $1
            """, [session_id])
            
            # Get most active character
            most_active = await self.db_service.fetch_one("""
                SELECT character_id, COUNT(*) as roll_count
                FROM dice_rolls 
                WHERE session_id = $1
                GROUP BY character_id
                ORDER BY roll_count DESC
                LIMIT 1
            """, [session_id])
            
            # Get roll type breakdown
            roll_types = await self.db_service.fetch_all("""
                SELECT roll_type, COUNT(*) as count
                FROM dice_rolls 
                WHERE session_id = $1
                GROUP BY roll_type
            """, [session_id])
            
            roll_type_breakdown = {row['roll_type']: row['count'] for row in roll_types}
            
            # Get performance metrics
            perf_metrics = await self.db_service.fetch_one("""
                SELECT 
                    AVG(response_time_ms) as avg_response_time,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
                    AVG(CASE WHEN response_time_ms < 100 THEN 1.0 ELSE 0.0 END) as sub_100ms_rate
                FROM dice_rolls 
                WHERE session_id = $1
            """, [session_id])
            
            performance_metrics = {}
            if perf_metrics:
                performance_metrics = {
                    'avg_response_time_ms': float(perf_metrics['avg_response_time'] or 0),
                    'p95_response_time_ms': float(perf_metrics['p95_response_time'] or 0),
                    'sub_100ms_rate': float(perf_metrics['sub_100ms_rate'] or 0)
                }
            
            return SessionSummary(
                session_id=session_id,
                start_time=session_info['start_time'] if session_info else datetime.now(),
                end_time=session_info['end_time'] if session_info else None,
                total_rolls=session_info['total_rolls'] if session_info else 0,
                unique_characters=session_info['unique_characters'] if session_info else 0,
                average_success_rate=float(session_info['avg_success_rate'] or 0),
                most_active_character=most_active['character_id'] if most_active else "",
                roll_type_breakdown=roll_type_breakdown,
                performance_metrics=performance_metrics
            )
            
        except Exception as e:
            print(f"Failed to get session summary for {session_id}: {e}")
            return SessionSummary(
                session_id=session_id,
                start_time=datetime.now(),
                end_time=None,
                total_rolls=0,
                unique_characters=0,
                average_success_rate=0.0,
                most_active_character="",
                roll_type_breakdown={},
                performance_metrics={}
            )
    
    async def cleanup_old_rolls(self, days_to_keep: int = 90):
        """Clean up old dice rolls to maintain database performance."""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            
            deleted_count = await self.db_service.execute_query("""
                DELETE FROM dice_rolls 
                WHERE timestamp < $1
            """, [cutoff_date])
            
            print(f"Cleaned up {deleted_count} dice rolls older than {days_to_keep} days")
            
            # Clear relevant caches
            self._analytics_cache.clear()
            self._last_cache_update.clear()
            
            return deleted_count
            
        except Exception as e:
            print(f"Failed to cleanup old dice rolls: {e}")
            return 0
    
    async def export_session_data(self, session_id: str) -> Dict[str, Any]:
        """Export all dice roll data for a session."""
        try:
            rolls = await self.get_recent_rolls(session_id, limit=10000)  # Get all rolls
            statistics = await self.get_session_statistics(session_id)
            analytics = await self.get_roll_analytics(session_id)
            summary = await self.get_session_summary(session_id)
            
            return {
                'session_id': session_id,
                'export_timestamp': datetime.now().isoformat(),
                'rolls': [roll.to_dict() for roll in rolls],
                'statistics': asdict(statistics),
                'analytics': asdict(analytics),
                'summary': asdict(summary)
            }
            
        except Exception as e:
            print(f"Failed to export session data for {session_id}: {e}")
            return {'session_id': session_id, 'error': str(e)}

# Global service instance
_dice_history_service: Optional[DiceHistoryService] = None

def get_dice_history_service() -> DiceHistoryService:
    """Get global dice history service instance."""
    global _dice_history_service
    if _dice_history_service is None:
        _dice_history_service = DiceHistoryService()
    return _dice_history_service