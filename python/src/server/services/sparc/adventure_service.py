"""
Adventure Content System for SPARC RPG.
Provides structured 1-hour adventures with branching paths and progression tracking.
"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
import json
import asyncio
from pathlib import Path

logger = logging.getLogger(__name__)


class SceneType(Enum):
    INTRODUCTION = "introduction"
    EXPLORATION = "exploration"
    SOCIAL = "social"
    CHALLENGE = "challenge"
    COMBAT = "combat"
    RESOLUTION = "resolution"


class OutcomeType(Enum):
    SUCCESS = "success"
    PARTIAL_SUCCESS = "partial_success"
    FAILURE = "failure"
    CRITICAL_SUCCESS = "critical_success"
    CRITICAL_FAILURE = "critical_failure"


class DifficultyLevel(Enum):
    NEWCOMER = "newcomer"
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"


@dataclass
class SceneOutcome:
    outcome_type: OutcomeType
    description: str
    consequence: str
    next_scene_id: Optional[str]
    progress_points: int
    confidence_impact: float


@dataclass
class AdventureScene:
    id: str
    title: str
    scene_type: SceneType
    description: str
    setup_text: str
    decision_prompt: str
    available_actions: List[Dict[str, Any]]
    outcomes: Dict[str, SceneOutcome]
    time_estimate_minutes: int
    difficulty_hints: List[str]
    gm_notes: str
    required_dice_rolls: List[Dict[str, Any]]


@dataclass
class AdventureTemplate:
    id: str
    title: str
    description: str
    theme: str
    difficulty_level: DifficultyLevel
    total_time_minutes: int
    target_players: int
    scenes: List[AdventureScene]
    learning_objectives: List[str]
    required_materials: List[str]
    success_criteria: Dict[str, Any]


@dataclass
class AdventureProgress:
    session_id: str
    adventure_id: str
    current_scene_id: str
    completed_scenes: List[str]
    scene_outcomes: Dict[str, OutcomeType]
    total_progress_points: int
    confidence_score: float
    time_spent_minutes: int
    started_at: datetime
    last_activity: datetime
    player_notes: List[str]
    gm_interventions: int
    is_completed: bool


class AdventureContentService:
    def __init__(self):
        self.active_adventures: Dict[str, AdventureProgress] = {}
        self.adventure_templates: Dict[str, AdventureTemplate] = {}
        self.scene_transition_cache: Dict[str, Dict[str, Any]] = {}
        self._load_adventure_templates()

    async def start_adventure(
        self,
        session_id: str,
        adventure_id: str,
        player_count: int = 2
    ) -> AdventureProgress:
        """Start a new adventure session."""
        if adventure_id not in self.adventure_templates:
            raise ValueError(f"Adventure template {adventure_id} not found")

        template = self.adventure_templates[adventure_id]
        first_scene = template.scenes[0]

        progress = AdventureProgress(
            session_id=session_id,
            adventure_id=adventure_id,
            current_scene_id=first_scene.id,
            completed_scenes=[],
            scene_outcomes={},
            total_progress_points=0,
            confidence_score=5.0,
            time_spent_minutes=0,
            started_at=datetime.now(),
            last_activity=datetime.now(),
            player_notes=[],
            gm_interventions=0,
            is_completed=False
        )

        self.active_adventures[session_id] = progress
        logger.info(f"Started adventure {adventure_id} for session {session_id}")
        return progress

    async def get_current_scene(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get the current scene for an active adventure."""
        if session_id not in self.active_adventures:
            return None

        progress = self.active_adventures[session_id]
        template = self.adventure_templates[progress.adventure_id]
        
        current_scene = next(
            (scene for scene in template.scenes if scene.id == progress.current_scene_id),
            None
        )
        
        if not current_scene:
            return None

        # Calculate dynamic difficulty adjustments based on progress
        adjusted_scene = self._adjust_scene_difficulty(current_scene, progress)
        
        return {
            "scene": {
                "id": adjusted_scene.id,
                "title": adjusted_scene.title,
                "scene_type": adjusted_scene.scene_type.value,
                "description": adjusted_scene.description,
                "setup_text": adjusted_scene.setup_text,
                "decision_prompt": adjusted_scene.decision_prompt,
                "available_actions": adjusted_scene.available_actions,
                "time_estimate_minutes": adjusted_scene.time_estimate_minutes,
                "difficulty_hints": adjusted_scene.difficulty_hints,
                "gm_notes": adjusted_scene.gm_notes,
                "required_dice_rolls": adjusted_scene.required_dice_rolls
            },
            "progress": {
                "scenes_completed": len(progress.completed_scenes),
                "total_scenes": len(template.scenes),
                "progress_points": progress.total_progress_points,
                "confidence_score": progress.confidence_score,
                "time_spent_minutes": progress.time_spent_minutes,
                "estimated_time_remaining": template.total_time_minutes - progress.time_spent_minutes
            }
        }

    async def process_scene_outcome(
        self,
        session_id: str,
        action_taken: str,
        dice_results: Optional[Dict[str, Any]] = None,
        player_narrative: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process the outcome of a scene action and advance the adventure."""
        if session_id not in self.active_adventures:
            raise ValueError(f"No active adventure found for session {session_id}")

        progress = self.active_adventures[session_id]
        template = self.adventure_templates[progress.adventure_id]
        
        current_scene = next(
            (scene for scene in template.scenes if scene.id == progress.current_scene_id),
            None
        )
        
        if not current_scene:
            raise ValueError(f"Current scene {progress.current_scene_id} not found")

        # Determine outcome based on action and dice results
        outcome = self._determine_scene_outcome(current_scene, action_taken, dice_results)
        
        # Update progress
        progress.completed_scenes.append(progress.current_scene_id)
        progress.scene_outcomes[progress.current_scene_id] = outcome.outcome_type
        progress.total_progress_points += outcome.progress_points
        progress.confidence_score += outcome.confidence_impact
        progress.last_activity = datetime.now()
        
        if player_narrative:
            progress.player_notes.append(f"Scene {progress.current_scene_id}: {player_narrative}")

        # Determine next scene
        next_scene_id = outcome.next_scene_id or self._get_default_next_scene(current_scene, template)
        
        if next_scene_id:
            progress.current_scene_id = next_scene_id
        else:
            progress.is_completed = True
            await self._finalize_adventure(progress, template)

        return {
            "outcome": {
                "type": outcome.outcome_type.value,
                "description": outcome.description,
                "consequence": outcome.consequence,
                "progress_points_earned": outcome.progress_points,
                "confidence_impact": outcome.confidence_impact
            },
            "next_scene_id": next_scene_id,
            "adventure_complete": progress.is_completed,
            "updated_progress": {
                "total_progress_points": progress.total_progress_points,
                "confidence_score": progress.confidence_score,
                "scenes_completed": len(progress.completed_scenes)
            }
        }

    async def generate_dynamic_content(
        self,
        session_id: str,
        content_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate dynamic content based on adventure progress and context."""
        if session_id not in self.active_adventures:
            raise ValueError(f"No active adventure found for session {session_id}")

        progress = self.active_adventures[session_id]
        
        generators = {
            "npc_dialogue": self._generate_npc_dialogue,
            "scene_description": self._generate_scene_description,
            "challenge_variation": self._generate_challenge_variation,
            "reward_description": self._generate_reward_description
        }
        
        if content_type not in generators:
            raise ValueError(f"Unknown content type: {content_type}")

        return await generators[content_type](progress, context)

    async def get_adventure_analytics(self, session_id: str) -> Dict[str, Any]:
        """Get detailed analytics for an adventure session."""
        if session_id not in self.active_adventures:
            return {"error": "No active adventure found"}

        progress = self.active_adventures[session_id]
        template = self.adventure_templates[progress.adventure_id]
        
        return {
            "session_id": session_id,
            "adventure_id": progress.adventure_id,
            "adventure_title": template.title,
            "progress_summary": {
                "completion_percentage": (len(progress.completed_scenes) / len(template.scenes)) * 100,
                "time_efficiency": progress.time_spent_minutes / template.total_time_minutes,
                "confidence_growth": progress.confidence_score - 5.0,
                "total_progress_points": progress.total_progress_points
            },
            "scene_performance": [
                {
                    "scene_id": scene_id,
                    "outcome": progress.scene_outcomes.get(scene_id, "unknown").value
                }
                for scene_id in progress.completed_scenes
            ],
            "learning_objectives_met": self._assess_learning_objectives(progress, template),
            "recommendations": self._generate_recommendations(progress, template)
        }

    def _load_adventure_templates(self):
        """Load adventure templates with structured 1-hour content."""
        
        # The Haunted Mill - Newcomer Adventure
        haunted_mill_scenes = [
            AdventureScene(
                id="intro_village",
                title="The Village of Millhaven",
                scene_type=SceneType.INTRODUCTION,
                description="A peaceful farming village with a concerning problem",
                setup_text="You arrive in Millhaven as the sun sets. The village elder approaches with worry in her eyes.",
                decision_prompt="The elder explains that strange noises come from the old mill at night. What do you do?",
                available_actions=[
                    {"id": "investigate_immediately", "text": "Head to the mill right now", "difficulty": "medium"},
                    {"id": "gather_information", "text": "Ask villagers about the mill", "difficulty": "easy"},
                    {"id": "wait_until_morning", "text": "Wait and investigate at dawn", "difficulty": "easy"}
                ],
                outcomes={
                    "investigate_immediately": SceneOutcome(
                        OutcomeType.PARTIAL_SUCCESS, 
                        "You bravely head out, but it's very dark", 
                        "You'll face the mill unprepared but show courage",
                        "mill_exterior_night",
                        10,
                        0.5
                    ),
                    "gather_information": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "Villagers share helpful details about the mill's history",
                        "You learn the mill was abandoned after a tragic accident",
                        "mill_exterior_prepared",
                        15,
                        1.0
                    ),
                    "wait_until_morning": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "You rest well and approach refreshed",
                        "Daylight reveals important details about the mill",
                        "mill_exterior_day",
                        12,
                        0.8
                    )
                },
                time_estimate_minutes=8,
                difficulty_hints=["Gathering information is usually helpful", "Sometimes patience pays off"],
                gm_notes="Establish the village atmosphere and the mystery. Let players feel the weight of decision-making.",
                required_dice_rolls=[]
            ),
            
            AdventureScene(
                id="mill_exterior_prepared",
                title="The Old Mill - Well Prepared",
                scene_type=SceneType.EXPLORATION,
                description="The abandoned mill looms before you, but you know its history",
                setup_text="Armed with knowledge from the villagers, you approach the mill with confidence.",
                decision_prompt="You see an open door and a broken window. How do you enter?",
                available_actions=[
                    {"id": "front_door", "text": "Walk through the front door boldly", "difficulty": "medium"},
                    {"id": "window_stealthily", "text": "Climb through the window quietly", "difficulty": "medium"},
                    {"id": "call_out_first", "text": "Call out to see if anyone responds", "difficulty": "easy"}
                ],
                outcomes={
                    "front_door": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "You enter confidently and avoid a loose floorboard",
                        "Your preparation helps you notice dangers",
                        "mill_interior_safe",
                        20,
                        1.2
                    ),
                    "window_stealthily": SceneOutcome(
                        OutcomeType.PARTIAL_SUCCESS,
                        "You climb in but make some noise",
                        "You're inside but may have alerted whatever is here",
                        "mill_interior_alert",
                        15,
                        0.8
                    ),
                    "call_out_first": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "A weak voice responds from inside - someone needs help!",
                        "You've found the source of the 'haunting' - a trapped person",
                        "rescue_scene",
                        25,
                        1.5
                    )
                },
                time_estimate_minutes=10,
                difficulty_hints=["Sometimes the direct approach works best", "Communication can reveal surprising solutions"],
                gm_notes="Reward their preparation with better outcomes. Show how knowledge gives advantages.",
                required_dice_rolls=[
                    {"type": "perception", "difficulty": 12, "purpose": "Notice environmental details"}
                ]
            ),
            
            AdventureScene(
                id="rescue_scene",
                title="The 'Ghost' Revealed",
                scene_type=SceneType.SOCIAL,
                description="Inside the mill, you find an injured traveler who's been trapped",
                setup_text="A young merchant lies with a broken leg, too weak to call for help during the day.",
                decision_prompt="The merchant needs help getting out. How do you assist them?",
                available_actions=[
                    {"id": "carry_immediately", "text": "Carry them out right away", "difficulty": "hard"},
                    {"id": "make_stretcher", "text": "Make a stretcher from mill materials", "difficulty": "medium"},
                    {"id": "get_village_help", "text": "Run to get help from the village", "difficulty": "easy"}
                ],
                outcomes={
                    "carry_immediately": SceneOutcome(
                        OutcomeType.PARTIAL_SUCCESS,
                        "You manage to help but strain yourself",
                        "The merchant is grateful but you're both exhausted",
                        "resolution_tired",
                        15,
                        0.5
                    ),
                    "make_stretcher": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "You create a clever stretcher and move them safely",
                        "Your resourcefulness impresses everyone",
                        "resolution_heroic",
                        25,
                        1.5
                    ),
                    "get_village_help": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "You organize a proper rescue with the villagers",
                        "The community comes together to help",
                        "resolution_community",
                        20,
                        1.2
                    )
                },
                time_estimate_minutes=12,
                difficulty_hints=["Think about what resources are available", "Sometimes the best solution involves others"],
                gm_notes="This reveals the mystery and shows how problems can have human solutions.",
                required_dice_rolls=[
                    {"type": "crafting", "difficulty": 14, "purpose": "Create makeshift stretcher"},
                    {"type": "strength", "difficulty": 15, "purpose": "Carry the merchant"}
                ]
            )
        ]

        self.adventure_templates["haunted_mill"] = AdventureTemplate(
            id="haunted_mill",
            title="The Haunted Mill",
            description="A mysterious haunting that isn't what it seems - perfect for newcomers",
            theme="Mystery with a human solution",
            difficulty_level=DifficultyLevel.NEWCOMER,
            total_time_minutes=60,
            target_players=2,
            scenes=haunted_mill_scenes,
            learning_objectives=[
                "Decision-making has consequences",
                "Gathering information is valuable",
                "Creative solutions often work best",
                "Not all mysteries have supernatural answers"
            ],
            required_materials=["2d6 dice", "character sheets", "paper for notes"],
            success_criteria={
                "primary_objective": "Solve the mystery of the haunted mill",
                "learning_goals": "Make meaningful decisions and see their impact",
                "confidence_target": 7.0
            }
        )

        # The Dragon's Riddle - Beginner Adventure
        dragons_riddle_scenes = [
            AdventureScene(
                id="crossroads_encounter",
                title="The Crossroads Guardian",
                scene_type=SceneType.INTRODUCTION,
                description="A majestic dragon blocks the path, but seems more interested in conversation than conflict",
                setup_text="At the crossroads, a shimmering dragon appears, not threatening, but clearly waiting for something.",
                decision_prompt="The dragon speaks: 'Answer my riddle correctly, and pass safely. Fail, and face a challenge of wit!' What do you do?",
                available_actions=[
                    {"id": "accept_riddle", "text": "Accept the riddle challenge", "difficulty": "medium"},
                    {"id": "try_to_negotiate", "text": "Ask if there are other options", "difficulty": "easy"},
                    {"id": "attempt_to_pass", "text": "Try to walk around the dragon", "difficulty": "hard"}
                ],
                outcomes={
                    "accept_riddle": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "The dragon nods approvingly at your courage",
                        "You've impressed the dragon with your boldness",
                        "riddle_challenge",
                        20,
                        1.2
                    ),
                    "try_to_negotiate": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "The dragon appreciates your diplomatic approach",
                        "Your wisdom in seeking understanding is rewarded",
                        "dragon_conversation",
                        18,
                        1.0
                    ),
                    "attempt_to_pass": SceneOutcome(
                        OutcomeType.PARTIAL_SUCCESS,
                        "The dragon allows your attempt but finds it amusing",
                        "Your boldness is noted, though perhaps not the wisest choice",
                        "riddle_challenge",
                        12,
                        0.5
                    )
                },
                time_estimate_minutes=10,
                difficulty_hints=["Dragons are often more reasonable than they appear", "Consider what the dragon might really want"],
                gm_notes="This dragon is wise and patient, more teacher than threat. Emphasize curiosity over fear.",
                required_dice_rolls=[
                    {"type": "charisma", "difficulty": 13, "purpose": "Make a good first impression"}
                ]
            ),
            
            AdventureScene(
                id="riddle_challenge",
                title="The Ancient Riddle",
                scene_type=SceneType.CHALLENGE,
                description="The dragon poses an ancient riddle that tests wisdom rather than mere cleverness",
                setup_text="'Here is my riddle,' says the dragon, eyes twinkling with ancient wisdom.",
                decision_prompt="'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?' How do you approach this?",
                available_actions=[
                    {"id": "think_carefully", "text": "Take time to think through the riddle", "difficulty": "medium"},
                    {"id": "guess_quickly", "text": "Go with your first instinct", "difficulty": "hard"},
                    {"id": "ask_for_hint", "text": "Politely ask for a hint", "difficulty": "easy"}
                ],
                outcomes={
                    "think_carefully": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "Your careful consideration leads to the answer: 'A map!'",
                        "The dragon beams with pride at your logical thinking",
                        "dragons_wisdom",
                        30,
                        2.0
                    ),
                    "guess_quickly": SceneOutcome(
                        OutcomeType.PARTIAL_SUCCESS,
                        "Your quick thinking shows promise, though you need a second try",
                        "The dragon appreciates your confidence but encourages patience",
                        "riddle_second_chance",
                        15,
                        0.8
                    ),
                    "ask_for_hint": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "The dragon smiles: 'Think of something that shows the world but contains none of it'",
                        "Your humility in seeking help is wisdom itself",
                        "riddle_with_hint",
                        25,
                        1.5
                    )
                },
                time_estimate_minutes=12,
                difficulty_hints=["Think about representations rather than reality", "What shows places without being a place?"],
                gm_notes="The answer is 'a map'. Allow creative interpretations and reward the thinking process over just getting it right.",
                required_dice_rolls=[
                    {"type": "intelligence", "difficulty": 14, "purpose": "Solve the riddle through logic"}
                ]
            ),
            
            AdventureScene(
                id="dragons_wisdom",
                title="The Dragon's Gift",
                scene_type=SceneType.RESOLUTION,
                description="Having proven your wisdom, the dragon shares ancient knowledge",
                setup_text="'Well done!' the dragon exclaims. 'Your wisdom has earned you something precious.'",
                decision_prompt="The dragon offers three gifts: ancient knowledge, a magical blessing, or a future favor. What do you choose?",
                available_actions=[
                    {"id": "choose_knowledge", "text": "Request ancient knowledge", "difficulty": "easy"},
                    {"id": "choose_blessing", "text": "Accept the magical blessing", "difficulty": "easy"},
                    {"id": "choose_favor", "text": "Ask for the future favor", "difficulty": "medium"}
                ],
                outcomes={
                    "choose_knowledge": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "The dragon shares wisdom about reading people and situations",
                        "You gain valuable insight that will help in future social encounters",
                        None,
                        35,
                        2.5
                    ),
                    "choose_blessing": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "The dragon grants you luck that will aid you when most needed",
                        "You feel more confident knowing fortune favors you",
                        None,
                        30,
                        2.0
                    ),
                    "choose_favor": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "The dragon promises to aid you once when you truly need help",
                        "You've gained a powerful ally through wisdom and respect",
                        None,
                        40,
                        3.0
                    )
                },
                time_estimate_minutes=8,
                difficulty_hints=["Each choice has value", "Consider what would help you most as an adventurer"],
                gm_notes="All choices are equally valid. This rewards the player's problem-solving and teaches that wisdom has many forms.",
                required_dice_rolls=[]
            )
        ]

        self.adventure_templates["dragons_riddle"] = AdventureTemplate(
            id="dragons_riddle",
            title="The Dragon's Riddle",
            description="A wise dragon tests your wits and rewards wisdom - perfect for building confidence",
            theme="Wisdom and respect triumph over force",
            difficulty_level=DifficultyLevel.BEGINNER,
            total_time_minutes=60,
            target_players=2,
            scenes=dragons_riddle_scenes,
            learning_objectives=[
                "Not all encounters need violence",
                "Patience and thought often win over haste",
                "Seeking help shows wisdom, not weakness",
                "Respect can turn enemies into allies"
            ],
            required_materials=["2d6 dice", "character sheets", "paper for notes"],
            success_criteria={
                "primary_objective": "Successfully interact with the dragon",
                "learning_goals": "Understand that intelligence and wisdom are powerful tools",
                "confidence_target": 8.0
            }
        )

        # The Merchant's Dilemma - Intermediate Adventure
        merchants_dilemma_scenes = [
            AdventureScene(
                id="market_square",
                title="Trouble in the Market",
                scene_type=SceneType.INTRODUCTION,
                description="The usually bustling market square is tense with an unfolding conflict",
                setup_text="You arrive to find two merchants in heated argument, with concerned citizens gathering around.",
                decision_prompt="One merchant accuses the other of selling cursed goods. The crowd grows restless. How do you intervene?",
                available_actions=[
                    {"id": "investigate_claims", "text": "Investigate the cursed goods claim", "difficulty": "medium"},
                    {"id": "calm_the_crowd", "text": "Try to calm the situation first", "difficulty": "medium"},
                    {"id": "separate_merchants", "text": "Separate the arguing merchants", "difficulty": "easy"},
                    {"id": "examine_evidence", "text": "Ask to see the 'cursed' goods", "difficulty": "hard"}
                ],
                outcomes={
                    "investigate_claims": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "Your methodical investigation reveals important clues",
                        "The merchants respect your thorough approach",
                        "investigation_path",
                        25,
                        1.5
                    ),
                    "calm_the_crowd": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "Your diplomatic words defuse the immediate tension",
                        "With cooler heads, the real problem can be addressed",
                        "mediation_path",
                        20,
                        1.2
                    ),
                    "separate_merchants": SceneOutcome(
                        OutcomeType.PARTIAL_SUCCESS,
                        "You create space between them, but the core issue remains",
                        "At least no one will come to blows while you think",
                        "careful_approach",
                        15,
                        0.8
                    ),
                    "examine_evidence": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "Your bold request to examine the goods shows confidence",
                        "Direct action cuts through the confusion",
                        "evidence_examination",
                        30,
                        2.0
                    )
                },
                time_estimate_minutes=12,
                difficulty_hints=["Complex situations often have multiple valid approaches", "Consider what information you need most"],
                gm_notes="This scenario has multiple branching paths. All approaches can lead to success with different lessons learned.",
                required_dice_rolls=[
                    {"type": "insight", "difficulty": 15, "purpose": "Read the situation accurately"}
                ]
            ),
            
            AdventureScene(
                id="investigation_path",
                title="Unraveling the Mystery",
                scene_type=SceneType.EXPLORATION,
                description="Your investigation reveals the situation is more complex than it first appeared",
                setup_text="As you examine the goods and question witnesses, a clearer picture emerges.",
                decision_prompt="You discover the 'cursed' items were actually stolen from a third party. How do you proceed with this sensitive information?",
                available_actions=[
                    {"id": "confront_privately", "text": "Speak privately with the accused merchant", "difficulty": "medium"},
                    {"id": "reveal_publicly", "text": "Share your findings with everyone", "difficulty": "hard"},
                    {"id": "seek_full_truth", "text": "Investigate further before deciding", "difficulty": "hard"},
                    {"id": "mediate_solution", "text": "Try to find a solution that helps everyone", "difficulty": "medium"}
                ],
                outcomes={
                    "confront_privately": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "The private conversation reveals the merchant's desperate circumstances",
                        "Understanding the full story opens paths to real solutions",
                        "compassionate_resolution",
                        35,
                        2.2
                    ),
                    "reveal_publicly": SceneOutcome(
                        OutcomeType.PARTIAL_SUCCESS,
                        "The truth helps, but public shame complicates things",
                        "Justice is served, but mercy might have been wiser",
                        "public_resolution",
                        25,
                        1.0
                    ),
                    "seek_full_truth": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "Your thorough investigation uncovers the whole network",
                        "Complete understanding allows for the best possible outcome",
                        "complete_resolution",
                        40,
                        2.8
                    ),
                    "mediate_solution": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "Your focus on solutions rather than blame impresses everyone",
                        "True leadership means finding ways for everyone to win",
                        "mediated_resolution",
                        38,
                        2.5
                    )
                },
                time_estimate_minutes=15,
                difficulty_hints=["Consider the consequences of your approach", "Sometimes the best solution helps everyone involved"],
                gm_notes="This tests the players' ability to handle complex moral situations with multiple valid approaches.",
                required_dice_rolls=[
                    {"type": "investigation", "difficulty": 16, "purpose": "Uncover the full truth"},
                    {"type": "empathy", "difficulty": 14, "purpose": "Understand everyone's motivations"}
                ]
            ),
            
            AdventureScene(
                id="compassionate_resolution",
                title="Understanding and Solutions",
                scene_type=SceneType.RESOLUTION,
                description="Your compassionate approach reveals the path to a solution that helps everyone",
                setup_text="The merchant's story touches your heart - desperation drove them to poor choices, but they want to make it right.",
                decision_prompt="With understanding comes opportunity. How do you help resolve this situation positively for all involved?",
                available_actions=[
                    {"id": "arrange_payment_plan", "text": "Arrange a payment plan for restitution", "difficulty": "easy"},
                    {"id": "find_honest_work", "text": "Help find honest work for the desperate merchant", "difficulty": "medium"},
                    {"id": "community_support", "text": "Rally community support for those in need", "difficulty": "hard"},
                    {"id": "systemic_solution", "text": "Address the underlying causes of desperation", "difficulty": "hard"}
                ],
                outcomes={
                    "arrange_payment_plan": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "Your practical solution allows dignity while ensuring justice",
                        "Everyone respects an approach that balances fairness with compassion",
                        None,
                        45,
                        3.0
                    ),
                    "find_honest_work": SceneOutcome(
                        OutcomeType.SUCCESS,
                        "By addressing root causes, you prevent future problems",
                        "True problem-solving looks beyond immediate issues",
                        None,
                        50,
                        3.5
                    ),
                    "community_support": SceneOutcome(
                        OutcomeType.CRITICAL_SUCCESS,
                        "Your leadership inspires the whole community to help",
                        "You've not just solved a problem, but strengthened social bonds",
                        None,
                        60,
                        4.0
                    ),
                    "systemic_solution": SceneOutcome(
                        OutcomeType.CRITICAL_SUCCESS,
                        "Your wisdom addresses not just this case but future ones",
                        "True leaders think beyond individual problems to systemic solutions",
                        None,
                        65,
                        4.5
                    )
                },
                time_estimate_minutes=13,
                difficulty_hints=["Think about solutions that address causes, not just symptoms", "The best outcomes help everyone involved"],
                gm_notes="This finale rewards players who think systemically and compassionately. All outcomes are positive, but some show greater wisdom.",
                required_dice_rolls=[
                    {"type": "leadership", "difficulty": 15, "purpose": "Inspire others to positive action"}
                ]
            )
        ]

        self.adventure_templates["merchants_dilemma"] = AdventureTemplate(
            id="merchants_dilemma",
            title="The Merchant's Dilemma",
            description="A complex social conflict that tests wisdom, empathy, and leadership skills",
            theme="Understanding and compassion lead to the best solutions",
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            total_time_minutes=60,
            target_players=2,
            scenes=merchants_dilemma_scenes,
            learning_objectives=[
                "Complex problems rarely have simple solutions",
                "Understanding motivations is key to resolution",
                "The best solutions often help everyone involved",
                "Leadership means thinking beyond immediate problems"
            ],
            required_materials=["2d6 dice", "character sheets", "paper for notes"],
            success_criteria={
                "primary_objective": "Resolve the merchant conflict positively",
                "learning_goals": "Develop skills in empathy, investigation, and systemic thinking",
                "confidence_target": 8.5
            }
        )

        logger.info(f"Loaded {len(self.adventure_templates)} adventure templates")

    def _adjust_scene_difficulty(
        self, 
        scene: AdventureScene, 
        progress: AdventureProgress
    ) -> AdventureScene:
        """Dynamically adjust scene difficulty based on player progress."""
        adjusted_scene = scene
        
        # If player is struggling (low confidence), make hints more obvious
        if progress.confidence_score < 4.0:
            adjusted_scene.difficulty_hints.extend([
                "Remember, there's no single 'right' answer",
                "Think about what your character would naturally do"
            ])
            # Reduce dice roll difficulties
            for dice_roll in adjusted_scene.required_dice_rolls:
                dice_roll["difficulty"] = max(10, dice_roll["difficulty"] - 2)
        
        # If player is excelling, add optional complexity
        elif progress.confidence_score > 7.0:
            adjusted_scene.gm_notes += " Consider adding extra details or consequences for advanced players."
        
        return adjusted_scene

    def _determine_scene_outcome(
        self,
        scene: AdventureScene,
        action_taken: str,
        dice_results: Optional[Dict[str, Any]]
    ) -> SceneOutcome:
        """Determine the outcome of a scene based on player actions."""
        base_outcome = scene.outcomes.get(action_taken)
        if not base_outcome:
            # Default outcome for unexpected actions
            return SceneOutcome(
                OutcomeType.PARTIAL_SUCCESS,
                "You try something unexpected",
                "Your creative approach has mixed results",
                None,
                10,
                0.5
            )
        
        # Modify outcome based on dice results if applicable
        if dice_results:
            dice_total = dice_results.get("total", 10)
            if dice_total >= 18:  # Critical success
                return SceneOutcome(
                    OutcomeType.CRITICAL_SUCCESS,
                    base_outcome.description + " - Exceptionally well!",
                    base_outcome.consequence + " Everyone is impressed by your skill.",
                    base_outcome.next_scene_id,
                    base_outcome.progress_points + 5,
                    base_outcome.confidence_impact + 0.5
                )
            elif dice_total <= 5:  # Critical failure
                return SceneOutcome(
                    OutcomeType.CRITICAL_FAILURE,
                    "Things don't go as planned at all",
                    "You'll need to find a different approach",
                    base_outcome.next_scene_id,
                    max(5, base_outcome.progress_points - 5),
                    base_outcome.confidence_impact - 0.3
                )
        
        return base_outcome

    def _get_default_next_scene(
        self, 
        current_scene: AdventureScene, 
        template: AdventureTemplate
    ) -> Optional[str]:
        """Get the default next scene when outcome doesn't specify one."""
        current_index = next(
            (i for i, scene in enumerate(template.scenes) if scene.id == current_scene.id),
            -1
        )
        
        if current_index >= 0 and current_index < len(template.scenes) - 1:
            return template.scenes[current_index + 1].id
        
        return None

    async def _finalize_adventure(
        self,
        progress: AdventureProgress,
        template: AdventureTemplate
    ):
        """Finalize adventure completion and calculate final scores."""
        progress.time_spent_minutes = int((datetime.now() - progress.started_at).total_seconds() / 60)
        
        # Calculate final confidence based on performance
        completion_bonus = 1.0 if len(progress.completed_scenes) == len(template.scenes) else 0.5
        time_bonus = 0.5 if progress.time_spent_minutes <= template.total_time_minutes else 0.0
        
        progress.confidence_score += completion_bonus + time_bonus
        progress.confidence_score = min(10.0, max(1.0, progress.confidence_score))
        
        logger.info(f"Adventure {progress.adventure_id} completed for session {progress.session_id}")

    async def _generate_npc_dialogue(
        self,
        progress: AdventureProgress,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate contextual NPC dialogue."""
        confidence_level = "confident" if progress.confidence_score > 6 else "encouraging"
        
        dialogues = {
            "confident": [
                "You seem to know what you're doing! Tell me your plan.",
                "I'm impressed by your approach so far.",
                "You're handling this better than most adventurers."
            ],
            "encouraging": [
                "Don't worry, everyone starts somewhere. What's your instinct?",
                "Take your time, there's no rush to decide.",
                "Remember, even experienced adventurers make mistakes."
            ]
        }
        
        return {
            "dialogue": dialogues[confidence_level][0],  # Would use more sophisticated selection
            "tone": confidence_level,
            "context_relevant": True
        }

    async def _generate_scene_description(
        self,
        progress: AdventureProgress,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate dynamic scene descriptions based on progress."""
        return {
            "description": f"The scene unfolds with details tailored to your progress...",
            "mood": "mysterious" if progress.confidence_score < 6 else "adventurous",
            "emphasis": context.get("focus_area", "exploration")
        }

    async def _generate_challenge_variation(
        self,
        progress: AdventureProgress,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate challenge variations based on player performance."""
        difficulty = "easier" if progress.confidence_score < 5 else "standard"
        
        return {
            "difficulty_adjustment": difficulty,
            "hint_level": "obvious" if progress.confidence_score < 4 else "subtle",
            "success_threshold": 12 if difficulty == "easier" else 15
        }

    async def _generate_reward_description(
        self,
        progress: AdventureProgress,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate appropriate reward descriptions."""
        return {
            "reward_type": "experience" if progress.confidence_score > 6 else "encouragement",
            "description": "Your success fills you with confidence!",
            "mechanical_benefit": f"+{context.get('points', 10)} progress points"
        }

    def _assess_learning_objectives(
        self,
        progress: AdventureProgress,
        template: AdventureTemplate
    ) -> Dict[str, bool]:
        """Assess whether learning objectives were met."""
        objectives_met = {}
        
        for objective in template.learning_objectives:
            if "decision-making" in objective.lower():
                objectives_met[objective] = len(progress.scene_outcomes) > 0
            elif "information" in objective.lower():
                objectives_met[objective] = any(
                    outcome == OutcomeType.SUCCESS 
                    for outcome in progress.scene_outcomes.values()
                )
            elif "creative" in objective.lower():
                objectives_met[objective] = progress.total_progress_points > 50
            else:
                objectives_met[objective] = progress.is_completed
        
        return objectives_met

    def _generate_recommendations(
        self,
        progress: AdventureProgress,
        template: AdventureTemplate
    ) -> List[str]:
        """Generate personalized recommendations for continued learning."""
        recommendations = []
        
        if progress.confidence_score < 6:
            recommendations.append("Try another newcomer-level adventure to build confidence")
        elif progress.confidence_score > 8:
            recommendations.append("You're ready for beginner-level adventures!")
        
        if progress.time_spent_minutes > template.total_time_minutes * 1.2:
            recommendations.append("Take time to think through decisions - there's no rush")
        elif progress.time_spent_minutes < template.total_time_minutes * 0.8:
            recommendations.append("You could explore scenes more deeply for richer experience")
        
        return recommendations


# Global service instance
_adventure_service: Optional[AdventureContentService] = None


async def get_adventure_service() -> AdventureContentService:
    """Get the global adventure service instance."""
    global _adventure_service
    if _adventure_service is None:
        _adventure_service = AdventureContentService()
    return _adventure_service