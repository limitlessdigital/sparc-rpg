"""
Performance tests for AI Seer Assistant.
Validates <3 second response time requirement.
"""

import pytest
import asyncio
import time
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from src.server.main import app
from src.server.services.sparc.openai_client import OpenAIClientService
from src.server.services.sparc.enhanced_ai_seer import EnhancedAISeerService


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)


@pytest.mark.asyncio
class TestAISeerPerformance:
    """Test AI Seer response time requirements."""
    
    async def test_openai_client_timeout_handling(self):
        """Test OpenAI client enforces timeout constraints."""
        client = OpenAIClientService()
        
        # Test with no API key (should fallback immediately)
        with patch.dict('os.environ', {}, clear=True):
            start_time = time.perf_counter()
            
            response = await client.generate_contextual_advice(
                prompt="Test prompt",
                context={},
                max_time_ms=3000
            )
            
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            
            # Should be very fast fallback
            assert elapsed_ms < 100
            assert response["fallback"] is True
            assert response["ai_unavailable"] is True
    
    async def test_enhanced_seer_quick_responses(self):
        """Test enhanced AI Seer provides quick responses for common patterns."""
        seer = EnhancedAISeerService()
        
        test_cases = [
            ("combat", "scene_guidance"),
            ("skill check", "rule_clarification"), 
            ("players confused", "player_help"),
            ("stuck", "scene_guidance")
        ]
        
        for query, request_type in test_cases:
            start_time = time.perf_counter()
            
            response = await seer.generate_contextual_advice(
                query=query,
                context={},
                request_type=request_type,
                max_time_ms=3000
            )
            
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            
            # Quick responses should be under 200ms
            assert elapsed_ms < 200, f"Query '{query}' took {elapsed_ms}ms"
            assert response["type"] == "quick_response"
    
    async def test_seer_performance_monitoring(self):
        """Test performance tracking works correctly."""
        seer = EnhancedAISeerService()
        
        # Generate some responses to track
        for i in range(5):
            await seer.generate_contextual_advice(
                query=f"Test query {i}",
                context={},
                request_type="general",
                max_time_ms=3000
            )
        
        stats = await seer.get_performance_stats()
        
        # Check stats structure
        assert "healthy" in stats
        assert "total_requests" in stats
        assert "average_response_time_ms" in stats
        assert "sub_3_second_rate" in stats
        assert stats["total_requests"] >= 5
    
    def test_api_endpoint_performance(self, client):
        """Test API endpoint meets performance requirements."""
        
        test_request = {
            "query": "Players seem stuck in combat",
            "context": {
                "session_id": "test_session",
                "current_scene": "Combat",
                "player_engagement": 4,
                "difficulty_level": "newcomer"
            },
            "request_type": "scene_guidance",
            "max_response_time_ms": 3000
        }
        
        start_time = time.perf_counter()
        
        response = client.post(
            "/api/sparc/ai/seer-advice",
            json=test_request
        )
        
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # API endpoint should respond within 3 seconds
        assert elapsed_ms < 3000, f"API took {elapsed_ms}ms"
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "advice" in data
        assert "response_time_ms" in data["advice"]
    
    def test_health_endpoint(self, client):
        """Test AI health endpoint."""
        response = client.get("/api/sparc/ai/health")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "services" in data
        assert "enhanced_ai_seer" in data["services"]
        assert "openai_integration" in data["services"]
    
    def test_performance_endpoint(self, client):
        """Test AI performance monitoring endpoint."""
        response = client.get("/api/sparc/ai/performance")
        assert response.status_code == 200
        
        data = response.json()
        assert "healthy" in data
        assert "features_available" in data
        assert data["target_response_time_s"] == 3.0
    
    def test_contextual_suggestions_performance(self, client):
        """Test contextual suggestions respond quickly."""
        
        test_request = {
            "context": {
                "session_id": "test_session",
                "current_scene": "Tavern",
                "player_engagement": 6
            },
            "suggestion_types": ["scene_guidance", "player_help"],
            "max_suggestions": 3
        }
        
        start_time = time.perf_counter()
        
        response = client.post(
            "/api/sparc/ai/contextual-suggestions",
            json=test_request
        )
        
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # Contextual suggestions should be very fast
        assert elapsed_ms < 1000, f"Contextual suggestions took {elapsed_ms}ms"
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "suggestions" in data
    
    def test_rule_clarification_performance(self, client):
        """Test rule clarification responds quickly."""
        
        test_request = {
            "query": "How does combat initiative work?",
            "context": {"session_id": "test_session"},
            "category": "dice_rolling"
        }
        
        start_time = time.perf_counter()
        
        response = client.post(
            "/api/sparc/ai/rule-clarification", 
            json=test_request
        )
        
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # Rule clarification should be very fast (cached lookup)
        assert elapsed_ms < 500, f"Rule clarification took {elapsed_ms}ms"
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "clarification" in data
    
    @pytest.mark.asyncio
    async def test_fallback_strategies(self):
        """Test fallback strategies work under various failure conditions."""
        seer = EnhancedAISeerService()
        
        # Test with simulated OpenAI failure
        with patch('src.server.services.sparc.enhanced_ai_seer.get_openai_client') as mock_client:
            mock_client.side_effect = Exception("OpenAI service unavailable")
            
            response = await seer.generate_contextual_advice(
                query="Test query with forced failure",
                context={},
                request_type="general",
                max_time_ms=3000
            )
            
            # Should still get a response via fallback
            assert response["type"] in ["scene_guidance", "player_help", "rule_clarification", "general"]
            assert "content" in response
            assert len(response["content"]) > 0
    
    def test_caching_performance(self, client):
        """Test response caching improves performance."""
        
        test_request = {
            "query": "What should I do when players are confused?",
            "context": {"difficulty_level": "newcomer"},
            "request_type": "player_help"
        }
        
        # First request
        start_time = time.perf_counter()
        response1 = client.post("/api/sparc/ai/seer-advice", json=test_request)
        elapsed_ms_1 = (time.perf_counter() - start_time) * 1000
        
        # Second identical request (should be cached)
        start_time = time.perf_counter()
        response2 = client.post("/api/sparc/ai/seer-advice", json=test_request)
        elapsed_ms_2 = (time.perf_counter() - start_time) * 1000
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Second request should be significantly faster due to caching
        # (This test might be flaky in CI, but good for development)
        if elapsed_ms_1 > 100:  # Only test if first request was slow enough
            assert elapsed_ms_2 < elapsed_ms_1 * 0.8, f"Cache didn't improve performance: {elapsed_ms_1}ms vs {elapsed_ms_2}ms"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])