"""
Tutorial & Onboarding Service for SPARC.
Designed to get new Seers (GMs) confident in 10 minutes with 80%+ confidence rating.
"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timezone, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
import json
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)


class TutorialStep(str, Enum):
    """Tutorial steps for the 10-minute Seer flow."""
    WELCOME = "welcome"
    BASIC_RULES = "basic_rules"
    CHARACTER_SHEETS = "character_sheets"
    DICE_ROLLING = "dice_rolling"
    SCENE_MANAGEMENT = "scene_management"
    TURN_ORDER = "turn_order"
    AI_ASSISTANT = "ai_assistant"
    PRACTICE_SCENARIO = "practice_scenario"
    CONFIDENCE_CHECK = "confidence_check"
    COMPLETION = "completion"


class OnboardingStage(str, Enum):
    """Player onboarding stages."""
    NEW_USER = "new_user"
    CHARACTER_CREATED = "character_created"
    FIRST_SESSION_JOINED = "first_session_joined"
    FIRST_DICE_ROLL = "first_dice_roll"
    SESSION_COMPLETED = "session_completed"
    EXPERIENCED_PLAYER = "experienced_player"


class ConfidenceArea(str, Enum):
    """Areas of GM confidence to track."""
    RULES_KNOWLEDGE = "rules_knowledge"
    SCENE_DESCRIPTION = "scene_description"
    PLAYER_MANAGEMENT = "player_management"
    DICE_MECHANICS = "dice_mechanics"
    STORYTELLING = "storytelling"
    TECHNICAL_COMFORT = "technical_comfort"


@dataclass
class TutorialProgress:
    """Tracks progress through tutorial steps."""
    user_id: str
    tutorial_type: str  # "seer" or "player"
    current_step: TutorialStep
    completed_steps: List[TutorialStep]
    step_start_times: Dict[str, datetime]
    step_completion_times: Dict[str, datetime]
    confidence_ratings: Dict[str, int]  # 1-10 scale per area
    practice_scenario_results: List[Dict[str, Any]]
    total_time_minutes: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    needs_additional_support: bool = False


@dataclass
class OnboardingMetrics:
    """Tracks player onboarding progress."""
    user_id: str
    current_stage: OnboardingStage
    stage_timestamps: Dict[str, datetime]
    sessions_played: int
    characters_created: int
    dice_rolls_made: int
    total_play_time_minutes: float
    milestone_achievements: List[str]
    needs_guidance: bool = False
    last_activity: Optional[datetime] = None


@dataclass
class TutorialScenario:
    """Practice scenario for tutorial."""
    id: str
    title: str
    description: str
    setup: str
    player_characters: List[Dict[str, Any]]
    decision_points: List[Dict[str, Any]]
    expected_actions: List[str]
    success_criteria: Dict[str, Any]
    time_limit_minutes: int
    difficulty_level: int  # 1-5


class SPARCTutorialService:
    """
    Comprehensive tutorial and onboarding service for SPARC.
    
    Goals:
    - Get new Seers confident in 10 minutes
    - Achieve 80%+ GM confidence rating
    - Smooth player onboarding with progress tracking
    - Interactive practice scenarios with feedback
    """
    
    def __init__(self):
        # Tutorial scenarios
        self.seer_scenarios = self._initialize_seer_scenarios()
        self.player_tutorials = self._initialize_player_tutorials()
        
        # Active tutorial sessions
        self.active_tutorials: Dict[str, TutorialProgress] = {}
        self.onboarding_tracking: Dict[str, OnboardingMetrics] = {}
        
        # Confidence thresholds
        self.confidence_targets = {
            ConfidenceArea.RULES_KNOWLEDGE: 7,  # Target: 7/10
            ConfidenceArea.SCENE_DESCRIPTION: 6,  # Target: 6/10  
            ConfidenceArea.PLAYER_MANAGEMENT: 6,  # Target: 6/10
            ConfidenceArea.DICE_MECHANICS: 8,   # Target: 8/10
            ConfidenceArea.STORYTELLING: 6,     # Target: 6/10
            ConfidenceArea.TECHNICAL_COMFORT: 7  # Target: 7/10
        }
    
    def _initialize_seer_scenarios(self) -> List[TutorialScenario]:
        """Initialize practice scenarios for Seer tutorial."""
        return [
            TutorialScenario(
                id="tavern_encounter",
                title="The Tavern Introduction",
                description="Your first scene - players meet in a tavern and get their first quest.",
                setup="Four adventurers sit around a wooden table in the Crimson Drake tavern. A hooded figure approaches with urgent news.",
                player_characters=[
                    {"name": "Aria", "class": "warrior", "hp": "18/18", "personality": "Bold and direct"},
                    {"name": "Finn", "class": "wizard", "hp": "12/12", "personality": "Curious and cautious"},
                    {"name": "Luna", "class": "rogue", "hp": "15/15", "personality": "Suspicious and witty"},
                    {"name": "Marcus", "class": "cleric", "hp": "16/16", "personality": "Kind and diplomatic"}
                ],
                decision_points=[
                    {
                        "situation": "The hooded figure says 'I need brave souls for a dangerous task.'",
                        "player_reactions": ["Aria wants to know more", "Finn examines the figure", "Luna checks for threats", "Marcus offers healing"],
                        "seer_choices": ["Reveal the quest", "Ask for dice rolls", "Describe the figure"]
                    },
                    {
                        "situation": "Players ask about reward and danger level.",
                        "guidance": "This is when you set stakes and build excitement",
                        "seer_choices": ["Offer specific gold amount", "Describe the danger vaguely", "Let players negotiate"]
                    }
                ],
                expected_actions=[
                    "Describe the scene setting mood",
                    "Respond to player questions",
                    "Call for dice rolls when appropriate",
                    "Advance the story based on outcomes"
                ],
                success_criteria={
                    "scene_description": "Vivid tavern atmosphere",
                    "player_engagement": "All players get spotlight time",
                    "dice_usage": "At least 2 dice rolls called",
                    "story_progression": "Quest accepted and direction established"
                },
                time_limit_minutes=8,
                difficulty_level=2
            ),
            
            TutorialScenario(
                id="combat_basics",
                title="First Combat Encounter",
                description="Handle a simple combat with bandits - practice turn order and dice mechanics.",
                setup="Two bandits ambush the party on a forest road. Initiative needs to be rolled.",
                player_characters=[
                    {"name": "Thora", "class": "paladin", "hp": "20/20", "weapon": "Sword and shield"},
                    {"name": "Zara", "class": "ranger", "hp": "17/17", "weapon": "Longbow"},
                    {"name": "Pip", "class": "rogue", "hp": "14/14", "weapon": "Twin daggers"}
                ],
                decision_points=[
                    {
                        "situation": "Combat begins - what do you do first?",
                        "correct_action": "Roll initiative for all combatants",
                        "common_mistakes": ["Forgetting initiative", "Not establishing turn order"]
                    },
                    {
                        "situation": "Player asks 'Can I attack twice?'",
                        "guidance": "Explain SPARC's simple action system",
                        "correct_response": "One action per turn in SPARC - attack OR special ability"
                    }
                ],
                expected_actions=[
                    "Roll initiative and establish turn order",
                    "Guide players through attack rolls",
                    "Apply damage and track HP",
                    "Describe combat outcomes vividly"
                ],
                success_criteria={
                    "initiative_managed": "Turn order established correctly",
                    "dice_mechanics": "Attack rolls handled properly",
                    "hp_tracking": "Damage applied accurately",
                    "pacing": "Combat completed in reasonable time"
                },
                time_limit_minutes=6,
                difficulty_level=3
            )
        ]
    
    def _initialize_player_tutorials(self) -> Dict[str, Any]:
        """Initialize player tutorial content."""
        return {
            "character_creation": {
                "steps": [
                    {"title": "Choose Your Class", "duration_minutes": 1},
                    {"title": "Pick Your Primary Stat", "duration_minutes": 1},
                    {"title": "Review Your Character", "duration_minutes": 1}
                ],
                "total_time_target": 3
            },
            "first_session": {
                "checkpoints": [
                    "Join a session",
                    "Understand your character sheet", 
                    "Make your first dice roll",
                    "Interact with other players",
                    "Complete a scene"
                ],
                "total_time_target": 15
            }
        }
    
    async def start_seer_tutorial(self, user_id: str) -> TutorialProgress:
        """Start the 10-minute Seer tutorial."""
        progress = TutorialProgress(
            user_id=user_id,
            tutorial_type="seer",
            current_step=TutorialStep.WELCOME,
            completed_steps=[],
            step_start_times={TutorialStep.WELCOME.value: datetime.now(timezone.utc)},
            step_completion_times={},
            confidence_ratings={},
            practice_scenario_results=[],
            total_time_minutes=0.0,
            started_at=datetime.now(timezone.utc)
        )
        
        self.active_tutorials[user_id] = progress
        logger.info(f"Started Seer tutorial for user {user_id}")
        return progress
    
    async def advance_tutorial_step(
        self, 
        user_id: str, 
        completed_step: TutorialStep,
        step_data: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, Optional[TutorialStep]]:
        """
        Advance to the next tutorial step.
        Returns (success, next_step).
        """
        if user_id not in self.active_tutorials:
            return False, None
        
        progress = self.active_tutorials[user_id]
        now = datetime.now(timezone.utc)
        
        # Record completion
        progress.completed_steps.append(completed_step)
        progress.step_completion_times[completed_step.value] = now
        
        # Calculate step duration
        step_start = progress.step_start_times.get(completed_step.value, now)
        step_duration = (now - step_start).total_seconds() / 60.0
        
        # Store step-specific data
        if step_data:
            if completed_step == TutorialStep.CONFIDENCE_CHECK:
                progress.confidence_ratings.update(step_data.get('ratings', {}))
            elif completed_step == TutorialStep.PRACTICE_SCENARIO:
                progress.practice_scenario_results.append(step_data)
        
        # Determine next step
        step_order = list(TutorialStep)
        current_index = step_order.index(completed_step)
        
        if current_index >= len(step_order) - 1:
            # Tutorial complete
            progress.completed_at = now
            progress.total_time_minutes = (now - progress.started_at).total_seconds() / 60.0
            return True, None
        
        next_step = step_order[current_index + 1]
        progress.current_step = next_step
        progress.step_start_times[next_step.value] = now
        
        return True, next_step
    
    def get_step_content(self, step: TutorialStep) -> Dict[str, Any]:
        """Get content for a tutorial step."""
        content_map = {
            TutorialStep.WELCOME: {
                "title": "Welcome to SPARC Seer Training!",
                "content": "In the next 10 minutes, you'll learn everything you need to run amazing SPARC adventures. SPARC is designed to be simple - perfect for your first time as a Game Master!",
                "duration_minutes": 0.5,
                "key_points": [
                    "SPARC uses only 6-sided dice",
                    "Players have 4 simple stats: STR, DEX, INT, CHA", 
                    "Your job is to describe scenes and guide the story",
                    "The AI Assistant will help you with rules and ideas"
                ],
                "next_action": "Let's start with the basic rules..."
            },
            
            TutorialStep.BASIC_RULES: {
                "title": "SPARC Rules in 90 Seconds",
                "content": "SPARC is intentionally simple. Here's everything players need to know:",
                "duration_minutes": 1.5,
                "key_points": [
                    "Roll 1d6 + stat vs difficulty (usually 8-16)",
                    "Combat: roll attack vs defense, deal damage",
                    "Special abilities: each character has one per adventure",
                    "Heroic saves: 3 per character to reroll failures"
                ],
                "interactive_element": "Try rolling dice with different difficulties",
                "success_criteria": "Understand basic dice mechanics"
            },
            
            TutorialStep.CHARACTER_SHEETS: {
                "title": "Understanding Character Sheets", 
                "content": "Each player has a simple character sheet. Let's explore what everything means:",
                "duration_minutes": 1.0,
                "demo_character": {
                    "name": "Tutorial Hero",
                    "class": "warrior", 
                    "stats": {"str": 6, "dex": 4, "int": 2, "cha": 3},
                    "hp": "18/18",
                    "special_ability": "Battle Fury",
                    "heroic_saves": "3/3"
                },
                "key_points": [
                    "Higher stats are better (1-6 scale)",
                    "HP represents health and stamina",
                    "Special abilities are powerful but limited",
                    "Players choose when to use heroic saves"
                ]
            },
            
            TutorialStep.DICE_ROLLING: {
                "title": "Managing Dice Rolls",
                "content": "When and how to call for dice rolls - this is your most important skill!",
                "duration_minutes": 2.0,
                "scenarios": [
                    {
                        "situation": "Player wants to climb a wall",
                        "call": "Roll STR vs difficulty 10",
                        "why": "Physical challenge with clear success/failure"
                    },
                    {
                        "situation": "Player asks what they see in a room",
                        "call": "Just describe it - no roll needed",
                        "why": "Basic perception doesn't need dice"
                    },
                    {
                        "situation": "Player tries to persuade the king",
                        "call": "Roll CHA vs difficulty 14",
                        "why": "High stakes social challenge"
                    }
                ],
                "key_principles": [
                    "Only roll when outcome is uncertain",
                    "Set difficulty before rolling",
                    "Describe results dramatically"
                ]
            },
            
            TutorialStep.SCENE_MANAGEMENT: {
                "title": "Bringing Scenes to Life",
                "content": "Your words paint the world. Learn to describe scenes that engage all the senses:",
                "duration_minutes": 1.5,
                "examples": [
                    {
                        "bland": "You're in a tavern.",
                        "vivid": "Warm firelight flickers across weathered oak tables. The air smells of roasted meat and ale, while a bard's lute mingles with hushed conversations."
                    },
                    {
                        "bland": "There are some bandits.",
                        "vivid": "Three rough-looking figures step from behind trees, leather armor creaking. Their leader grins, revealing gold teeth as he hefts a notched axe."
                    }
                ],
                "techniques": [
                    "Use 2-3 sensory details per scene",
                    "Give NPCs one memorable trait", 
                    "Ask players what their characters do",
                    "Build on player descriptions"
                ]
            },
            
            TutorialStep.TURN_ORDER: {
                "title": "Managing Turn Order & Initiative",
                "content": "Keep the game flowing smoothly with good turn management:",
                "duration_minutes": 1.0,
                "key_points": [
                    "Roll initiative for combat (1d6 + DEX)",
                    "Outside combat, spotlight different players",
                    "Use the 'popcorn' method - let players pass initiative",
                    "Don't let anyone dominate the conversation"
                ],
                "interactive_demo": "Practice managing a 4-player initiative order"
            },
            
            TutorialStep.AI_ASSISTANT: {
                "title": "Using Your AI Seer Assistant",
                "content": "You have a powerful AI assistant to help with rules, ideas, and situations:",
                "duration_minutes": 1.0,
                "features": [
                    "Ask about any rule - get instant clarification",
                    "Request scene suggestions when stuck",
                    "Get tactical advice for combat balance",
                    "Generate NPC names and personalities"
                ],
                "sample_prompts": [
                    "What should happen next in this scene?",
                    "How does grappling work?",
                    "Suggest some complications for this quest",
                    "Is this encounter too hard for level 1 characters?"
                ],
                "interactive_element": "Try asking the AI assistant a few questions"
            },
            
            TutorialStep.PRACTICE_SCENARIO: {
                "title": "Practice Session: The Tavern",
                "content": "Time to put it all together! Run a short practice scenario with simulated players.",
                "duration_minutes": 3.0,
                "scenario": self.seer_scenarios[0],  # Tavern encounter
                "guidance": [
                    "Start by describing the tavern scene",
                    "Introduce the hooded figure with mystery",
                    "Call for dice rolls when players investigate",
                    "End with the quest hook established"
                ],
                "evaluation_criteria": [
                    "Scene description quality",
                    "Player engagement",
                    "Dice roll timing",
                    "Story progression"
                ]
            }
        }
        
        return content_map.get(step, {"title": "Unknown Step", "content": ""})
    
    async def evaluate_scenario_performance(
        self,
        user_id: str,
        scenario_id: str,
        actions_taken: List[str],
        dice_rolls_called: List[Dict[str, Any]],
        scene_descriptions: List[str]
    ) -> Dict[str, Any]:
        """Evaluate how well the user performed in a practice scenario."""
        scenario = next((s for s in self.seer_scenarios if s.id == scenario_id), None)
        if not scenario:
            return {"error": "Scenario not found"}
        
        evaluation = {
            "scenario_id": scenario_id,
            "overall_score": 0,  # 0-100
            "area_scores": {},
            "feedback": [],
            "strengths": [],
            "improvement_areas": []
        }
        
        # Evaluate scene description quality
        description_score = 0
        if scene_descriptions:
            avg_length = sum(len(desc.split()) for desc in scene_descriptions) / len(scene_descriptions)
            has_sensory_details = any("smell" in desc or "sound" in desc or "feel" in desc 
                                    for desc in scene_descriptions)
            
            description_score = min(100, (avg_length * 2) + (30 if has_sensory_details else 0))
            
            if description_score >= 70:
                evaluation["strengths"].append("Vivid scene descriptions")
            else:
                evaluation["improvement_areas"].append("Add more sensory details to scenes")
        
        evaluation["area_scores"]["scene_description"] = description_score
        
        # Evaluate dice roll usage
        dice_score = 0
        expected_rolls = len(scenario.decision_points)
        actual_rolls = len(dice_rolls_called)
        
        if actual_rolls > 0:
            dice_score = min(100, (actual_rolls / expected_rolls) * 100)
            
            # Check if difficulties were appropriate
            appropriate_difficulties = sum(
                1 for roll in dice_rolls_called 
                if 6 <= roll.get('difficulty', 0) <= 18
            )
            dice_score *= (appropriate_difficulties / len(dice_rolls_called))
            
            if dice_score >= 70:
                evaluation["strengths"].append("Good dice roll timing")
            else:
                evaluation["improvement_areas"].append("Practice calling for dice rolls at key moments")
        
        evaluation["area_scores"]["dice_mechanics"] = dice_score
        
        # Evaluate story progression
        story_score = 0
        if len(actions_taken) >= len(scenario.expected_actions) * 0.7:
            story_score = min(100, (len(actions_taken) / len(scenario.expected_actions)) * 100)
            
            if story_score >= 70:
                evaluation["strengths"].append("Strong story progression")
            else:
                evaluation["improvement_areas"].append("Focus on advancing the story")
        
        evaluation["area_scores"]["story_progression"] = story_score
        
        # Overall score
        evaluation["overall_score"] = (description_score + dice_score + story_score) / 3
        
        # Generate feedback
        if evaluation["overall_score"] >= 80:
            evaluation["feedback"].append("Excellent performance! You're ready to run SPARC adventures.")
        elif evaluation["overall_score"] >= 60:
            evaluation["feedback"].append("Good job! A few more practice sessions and you'll be confident.")
        else:
            evaluation["feedback"].append("Keep practicing! Focus on the improvement areas listed.")
        
        return evaluation
    
    async def calculate_confidence_rating(self, user_id: str) -> Dict[str, Any]:
        """Calculate overall confidence rating for a user."""
        if user_id not in self.active_tutorials:
            return {"error": "Tutorial not found"}
        
        progress = self.active_tutorials[user_id]
        
        # Get confidence ratings from user input
        ratings = progress.confidence_ratings
        
        # Calculate scores from practice scenarios
        scenario_scores = {}
        for result in progress.practice_scenario_results:
            for area, score in result.get("area_scores", {}).items():
                scenario_scores[area] = max(scenario_scores.get(area, 0), score)
        
        # Combine ratings with scenario performance
        final_confidence = {}
        total_confidence = 0
        areas_evaluated = 0
        
        for area, target in self.confidence_targets.items():
            user_rating = ratings.get(area.value, 5)  # Default to middle rating
            scenario_score = scenario_scores.get(area.value, 70)  # Default to passing
            
            # Weight: 70% user self-assessment, 30% scenario performance
            combined_score = (user_rating * 0.7) + ((scenario_score / 10) * 0.3)
            final_confidence[area.value] = {
                "score": combined_score,
                "target": target,
                "meets_target": combined_score >= target,
                "user_rating": user_rating,
                "performance_score": scenario_score
            }
            
            total_confidence += combined_score
            areas_evaluated += 1
        
        overall_confidence = total_confidence / areas_evaluated if areas_evaluated > 0 else 0
        confidence_percentage = (overall_confidence / 10) * 100
        
        return {
            "user_id": user_id,
            "overall_confidence": overall_confidence,
            "confidence_percentage": confidence_percentage,
            "meets_target": confidence_percentage >= 80,
            "area_breakdown": final_confidence,
            "tutorial_completion_time": progress.total_time_minutes,
            "ready_to_gm": confidence_percentage >= 80 and len(progress.completed_steps) >= 8
        }
    
    async def track_onboarding_milestone(
        self,
        user_id: str,
        milestone: str,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Track player onboarding milestones."""
        if user_id not in self.onboarding_tracking:
            self.onboarding_tracking[user_id] = OnboardingMetrics(
                user_id=user_id,
                current_stage=OnboardingStage.NEW_USER,
                stage_timestamps={OnboardingStage.NEW_USER.value: datetime.now(timezone.utc)},
                sessions_played=0,
                characters_created=0,
                dice_rolls_made=0,
                total_play_time_minutes=0.0,
                milestone_achievements=[]
            )
        
        metrics = self.onboarding_tracking[user_id]
        metrics.milestone_achievements.append(milestone)
        metrics.last_activity = datetime.now(timezone.utc)
        
        # Update stage based on milestone
        if milestone == "character_created":
            metrics.characters_created += 1
            if metrics.current_stage == OnboardingStage.NEW_USER:
                metrics.current_stage = OnboardingStage.CHARACTER_CREATED
                metrics.stage_timestamps[OnboardingStage.CHARACTER_CREATED.value] = datetime.now(timezone.utc)
        
        elif milestone == "session_joined":
            if metrics.current_stage == OnboardingStage.CHARACTER_CREATED:
                metrics.current_stage = OnboardingStage.FIRST_SESSION_JOINED
                metrics.stage_timestamps[OnboardingStage.FIRST_SESSION_JOINED.value] = datetime.now(timezone.utc)
        
        elif milestone == "dice_roll":
            metrics.dice_rolls_made += 1
            if metrics.current_stage == OnboardingStage.FIRST_SESSION_JOINED:
                metrics.current_stage = OnboardingStage.FIRST_DICE_ROLL
                metrics.stage_timestamps[OnboardingStage.FIRST_DICE_ROLL.value] = datetime.now(timezone.utc)
        
        # Store additional data
        if additional_data:
            if "session_duration" in additional_data:
                metrics.total_play_time_minutes += additional_data["session_duration"]
            if "session_completed" in additional_data:
                metrics.sessions_played += 1
                if metrics.current_stage == OnboardingStage.FIRST_DICE_ROLL:
                    metrics.current_stage = OnboardingStage.SESSION_COMPLETED
                    metrics.stage_timestamps[OnboardingStage.SESSION_COMPLETED.value] = datetime.now(timezone.utc)
        
        logger.info(f"Onboarding milestone '{milestone}' tracked for user {user_id}")
    
    def get_tutorial_analytics(self) -> Dict[str, Any]:
        """Get analytics on tutorial effectiveness."""
        completed_tutorials = [t for t in self.active_tutorials.values() if t.completed_at]
        
        if not completed_tutorials:
            return {"message": "No completed tutorials yet"}
        
        # Calculate metrics
        completion_times = [t.total_time_minutes for t in completed_tutorials]
        avg_completion_time = sum(completion_times) / len(completion_times)
        
        # Confidence ratings
        confident_users = 0
        for user_id in [t.user_id for t in completed_tutorials]:
            confidence_data = asyncio.create_task(self.calculate_confidence_rating(user_id))
            # This would need to be awaited properly in real implementation
            
        return {
            "total_tutorials_started": len(self.active_tutorials),
            "total_tutorials_completed": len(completed_tutorials),
            "completion_rate": len(completed_tutorials) / len(self.active_tutorials) if self.active_tutorials else 0,
            "avg_completion_time_minutes": avg_completion_time,
            "target_completion_time": 10,
            "meets_time_target": avg_completion_time <= 12,  # 2 minute buffer
            "onboarding_users_tracked": len(self.onboarding_tracking)
        }


# Global tutorial service instance
_tutorial_service: Optional[SPARCTutorialService] = None


async def get_tutorial_service() -> SPARCTutorialService:
    """Get or create tutorial service."""
    global _tutorial_service
    if _tutorial_service is None:
        _tutorial_service = SPARCTutorialService()
    return _tutorial_service