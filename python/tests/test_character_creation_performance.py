"""
Character Creation Performance Tests.
Validates <5 minute character creation requirement for SPARC RPG.
"""

import pytest
import time
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from src.server.main import app
from src.server.services.sparc.character_service import CharacterCreationService
from src.server.services.sparc.models import CreateCharacterRequest, CharacterClass


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)


@pytest.fixture
def character_service():
    """Character service fixture."""
    return CharacterCreationService()


class TestCharacterCreationPerformance:
    """Test character creation meets 5-minute requirement."""
    
    def test_character_service_performance(self, character_service):
        """Test in-memory character creation is fast."""
        
        request = CreateCharacterRequest(
            name="Speed Test Hero",
            character_class=CharacterClass.WARRIOR,
            primary_stat="str"
        )
        
        # Measure character creation time
        start_time = time.perf_counter()
        character = character_service.create_character("test_user", request)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # Should be extremely fast (under 1 second for in-memory)
        assert elapsed_ms < 1000, f"Character creation took {elapsed_ms}ms"
        assert character.name == "Speed Test Hero"
        assert character.character_class == CharacterClass.WARRIOR
        assert character.stats.str > character.stats.dex  # Primary stat bonus applied
    
    def test_character_validation_performance(self, character_service):
        """Test character validation is fast."""
        
        test_names = [
            "Valid Name",
            "Another-Valid Name",
            "O'Brien",
            "Jean-Luc",
            "Mary Jane Watson",
            "X" * 50  # Maximum length
        ]
        
        start_time = time.perf_counter()
        
        for name in test_names:
            result = character_service.validate_character_name(name)
            assert result is True, f"Name '{name}' should be valid"
        
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # All validations should be very fast
        assert elapsed_ms < 100, f"Validation took {elapsed_ms}ms for {len(test_names)} names"
    
    def test_character_preview_performance(self, character_service):
        """Test character preview generation is fast."""
        
        request = CreateCharacterRequest(
            name="Preview Test",
            character_class=CharacterClass.WIZARD,
            primary_stat="int"
        )
        
        start_time = time.perf_counter()
        preview = character_service.get_character_preview(request)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # Preview should be very fast
        assert elapsed_ms < 100, f"Preview generation took {elapsed_ms}ms"
        assert preview["name"] == "Preview Test"
        assert preview["character_class"] == CharacterClass.WIZARD
        assert "stats" in preview
        assert "equipment" in preview
        assert "special_ability" in preview
    
    def test_api_endpoint_performance(self, client):
        """Test character creation API endpoint performance."""
        
        character_request = {
            "name": "API Speed Test",
            "character_class": "paladin",
            "primary_stat": "str"
        }
        
        # Mock database to avoid connection issues in test
        with patch('src.server.api_routes.sparc_characters_api.get_character_database') as mock_db:
            mock_db.side_effect = Exception("Database not available")
            
            start_time = time.perf_counter()
            response = client.post("/api/sparc/characters/", json=character_request)
            elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # API should respond quickly even without database
        assert elapsed_ms < 5000, f"API took {elapsed_ms}ms (should be <5s)"
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == "API Speed Test"
        assert data["character_class"] == "paladin"
        assert data["id"] is not None  # Should have temporary ID
    
    def test_template_endpoint_performance(self, client):
        """Test character templates endpoint performance."""
        
        start_time = time.perf_counter()
        response = client.get("/api/sparc/characters/templates")
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # Templates should load very fast
        assert elapsed_ms < 1000, f"Templates took {elapsed_ms}ms"
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 7  # All SPARC classes
        assert "warrior" in data
        assert "wizard" in data
    
    def test_preview_endpoint_performance(self, client):
        """Test character preview endpoint performance."""
        
        preview_request = {
            "name": "Preview Speed Test",
            "character_class": "ranger", 
            "primary_stat": "dex"
        }
        
        start_time = time.perf_counter()
        response = client.post("/api/sparc/characters/preview", json=preview_request)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        # Preview should be very fast
        assert elapsed_ms < 1000, f"Preview endpoint took {elapsed_ms}ms"
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Preview Speed Test"
        assert data["character_class"] == "ranger"
        assert data["stats"]["dex"] > data["stats"]["str"]  # Primary stat bonus
    
    def test_performance_monitoring_endpoint(self, client):
        """Test performance monitoring endpoint."""
        
        # Mock database performance stats
        with patch('src.server.api_routes.sparc_characters_api.get_character_database') as mock_db:
            mock_db.return_value.get_creation_performance_stats = AsyncMock(return_value={
                "total_characters_created": 100,
                "avg_creation_time_ms": 2500,
                "median_creation_time_ms": 2000,
                "p95_creation_time_ms": 4000,
                "under_5_minutes_rate": 98.0,
                "last_character_created": "2024-01-01T12:00:00Z"
            })
            
            response = client.get("/api/sparc/characters/performance/creation-stats")
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["stats"]["healthy"] is True  # >95% under 5 minutes
        assert data["stats"]["performance_target_ms"] == 300000
        assert data["stats"]["under_5_minutes_rate"] == 98.0
    
    def test_all_character_classes_performance(self, character_service):
        """Test character creation for all classes is fast."""
        
        all_classes = [
            CharacterClass.WARRIOR,
            CharacterClass.PALADIN,
            CharacterClass.WIZARD,
            CharacterClass.CLERIC,
            CharacterClass.ROGUE,
            CharacterClass.RANGER,
            CharacterClass.NECROMANCER
        ]
        
        primary_stats = ["str", "dex", "int", "cha"]
        
        start_time = time.perf_counter()
        
        characters_created = 0
        for character_class in all_classes:
            for primary_stat in primary_stats:
                request = CreateCharacterRequest(
                    name=f"Test {character_class.value} {primary_stat.upper()}",
                    character_class=character_class,
                    primary_stat=primary_stat
                )
                
                character = character_service.create_character("perf_test", request)
                assert character is not None
                characters_created += 1
        
        total_elapsed_ms = (time.perf_counter() - start_time) * 1000
        avg_per_character_ms = total_elapsed_ms / characters_created
        
        # Should be able to create all combinations very quickly
        assert total_elapsed_ms < 5000, f"Created {characters_created} characters in {total_elapsed_ms}ms"
        assert avg_per_character_ms < 200, f"Average {avg_per_character_ms}ms per character"
        
        print(f"Performance: Created {characters_created} characters in {total_elapsed_ms:.1f}ms "
              f"(avg {avg_per_character_ms:.1f}ms per character)")
    
    def test_character_creation_wizard_simulation(self, client):
        """Simulate complete 3-step character creation wizard flow."""
        
        start_time = time.perf_counter()
        
        # Step 1: Get templates (class selection)
        templates_response = client.get("/api/sparc/characters/templates")
        assert templates_response.status_code == 200
        step1_time = time.perf_counter()
        
        # Step 2: Get preview (identity definition) 
        preview_request = {
            "name": "Wizard Simulation Test",
            "character_class": "wizard",
            "primary_stat": "int"
        }
        preview_response = client.post("/api/sparc/characters/preview", json=preview_request)
        assert preview_response.status_code == 200
        step2_time = time.perf_counter()
        
        # Step 3: Create character (final creation)
        with patch('src.server.api_routes.sparc_characters_api.get_character_database') as mock_db:
            mock_db.side_effect = Exception("Database not available")
            
            create_response = client.post("/api/sparc/characters/", json=preview_request)
            assert create_response.status_code == 201
        
        step3_time = time.perf_counter()
        
        # Calculate step timings
        step1_ms = (step1_time - start_time) * 1000
        step2_ms = (step2_time - step1_time) * 1000  
        step3_ms = (step3_time - step2_time) * 1000
        total_ms = (step3_time - start_time) * 1000
        
        # All steps should be fast, total under 5 minutes
        assert step1_ms < 1000, f"Step 1 (templates) took {step1_ms}ms"
        assert step2_ms < 1000, f"Step 2 (preview) took {step2_ms}ms"
        assert step3_ms < 5000, f"Step 3 (create) took {step3_ms}ms"
        assert total_ms < 300000, f"Total wizard took {total_ms}ms (should be <5 minutes)"
        
        print(f"Wizard Performance: Step1={step1_ms:.1f}ms, Step2={step2_ms:.1f}ms, "
              f"Step3={step3_ms:.1f}ms, Total={total_ms:.1f}ms")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])