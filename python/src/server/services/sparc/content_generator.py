"""
Dynamic Content Generation Service for SPARC Adventures.
Provides AI-driven content hooks for procedural adventure elements.
"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import logging
import random
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class ContentType(Enum):
    NPC_DIALOGUE = "npc_dialogue"
    SCENE_DESCRIPTION = "scene_description"
    CHALLENGE_VARIATION = "challenge_variation"
    REWARD_DESCRIPTION = "reward_description"
    CONSEQUENCE_NARRATIVE = "consequence_narrative"
    ENVIRONMENT_DETAIL = "environment_detail"
    PLOT_TWIST = "plot_twist"


class GenerationContext(Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    PARTIAL_SUCCESS = "partial_success"
    CRITICAL_SUCCESS = "critical_success"
    CRITICAL_FAILURE = "critical_failure"
    NEWCOMER_STRUGGLING = "newcomer_struggling"
    NEWCOMER_EXCELLING = "newcomer_excelling"


@dataclass
class ContentTemplate:
    content_type: ContentType
    context: GenerationContext
    template_text: str
    variables: List[str]
    tone: str
    complexity_level: str


@dataclass
class GenerationRequest:
    content_type: ContentType
    context: Dict[str, Any]
    player_history: Dict[str, Any]
    scene_metadata: Dict[str, Any]
    customization_hints: List[str]


class DynamicContentGenerator:
    def __init__(self):
        self.content_templates: Dict[Tuple[ContentType, GenerationContext], List[ContentTemplate]] = {}
        self.character_archetypes = {
            "village_elder": {
                "personality": "wise, caring, concerned about community",
                "speech_patterns": ["speaks slowly", "uses old sayings", "references the past"],
                "motivations": ["protect the village", "help young adventurers", "preserve traditions"]
            },
            "trapped_merchant": {
                "personality": "grateful, resourceful, slightly embarrassed",
                "speech_patterns": ["speaks quickly when excited", "uses trade terminology", "offers rewards"],
                "motivations": ["return to family", "complete business deals", "repay kindness"]
            },
            "helpful_villager": {
                "personality": "friendly, knowledgeable, supportive",
                "speech_patterns": ["asks questions", "shares local knowledge", "encourages adventurers"],
                "motivations": ["help newcomers", "share stories", "feel useful"]
            }
        }
        self.environmental_themes = {
            "haunted_mill": {
                "atmosphere": "mysterious, slightly eerie, but ultimately safe",
                "details": ["creaking wood", "dust motes in moonbeams", "old machinery", "stone grinding wheels"],
                "sounds": ["wind through gaps", "settling timbers", "distant water wheel", "small animals"]
            },
            "peaceful_village": {
                "atmosphere": "warm, welcoming, cozy",
                "details": ["thatched roofs", "flower gardens", "cobblestone paths", "warm lamplight"],
                "sounds": ["distant laughter", "cooking sounds", "farm animals", "gentle breeze"]
            }
        }
        self._load_content_templates()

    async def generate_content(
        self,
        request: GenerationRequest
    ) -> Dict[str, Any]:
        """Generate dynamic content based on request parameters."""
        try:
            generator_method = self._get_generator_method(request.content_type)
            return await generator_method(request)
        except Exception as e:
            logger.error(f"Failed to generate content for {request.content_type}: {e}")
            return self._get_fallback_content(request.content_type)

    async def generate_npc_dialogue(
        self,
        request: GenerationRequest
    ) -> Dict[str, Any]:
        """Generate contextual NPC dialogue."""
        context = request.context
        player_history = request.player_history
        
        npc_type = context.get("npc_type", "generic")
        confidence_score = player_history.get("confidence_score", 5.0)
        previous_actions = player_history.get("completed_actions", [])
        
        # Select appropriate archetype
        archetype = self.character_archetypes.get(npc_type, self.character_archetypes["helpful_villager"])
        
        # Determine tone based on player confidence
        if confidence_score < 4.0:
            tone = "encouraging"
            dialogue_options = [
                "Don't worry, {character_name}. Everyone starts somewhere, and you're doing better than you think.",
                "Take your time with this decision. There's wisdom in careful thought.",
                "I've seen many adventurers in my time, and the thoughtful ones often succeed where the hasty fail.",
                "Your caution shows wisdom beyond your years. Trust your instincts."
            ]
        elif confidence_score > 7.0:
            tone = "impressed"
            dialogue_options = [
                "Remarkable! Your approach shows real understanding of the situation.",
                "I'm impressed by your quick thinking, {character_name}. You have natural talent.",
                "Your confidence is well-placed. You're handling this like a seasoned adventurer.",
                "Excellent work! You've clearly been paying attention."
            ]
        else:
            tone = "supportive"
            dialogue_options = [
                "You're on the right track, {character_name}. What's your next move?",
                "Interesting approach. I can see you're thinking this through carefully.",
                "Good instincts! How do you want to proceed?",
                "That's a solid plan. Tell me more about how you'll execute it."
            ]
        
        # Add context-specific elements
        if "investigation" in str(previous_actions).lower():
            dialogue_options.append("Your thorough investigation is paying off. What did you discover?")
        
        if "creative" in context.get("last_action_type", ""):
            dialogue_options.append("Creative thinking! I wouldn't have thought of that approach.")
        
        # Select and customize dialogue
        base_dialogue = random.choice(dialogue_options)
        character_name = context.get("character_name", "adventurer")
        
        customized_dialogue = base_dialogue.replace("{character_name}", character_name)
        
        return {
            "dialogue": customized_dialogue,
            "tone": tone,
            "speaker": npc_type,
            "personality_notes": archetype["personality"],
            "delivery_hints": random.choice(archetype["speech_patterns"]),
            "context_awareness": True,
            "follow_up_options": self._generate_follow_up_options(tone, context)
        }

    async def generate_scene_description(
        self,
        request: GenerationRequest
    ) -> Dict[str, Any]:
        """Generate dynamic scene descriptions with environmental details."""
        context = request.context
        scene_metadata = request.scene_metadata
        
        scene_theme = scene_metadata.get("theme", "generic")
        time_of_day = context.get("time_of_day", "evening")
        weather = context.get("weather", "clear")
        player_approach = context.get("approach_style", "cautious")
        
        # Get base environmental theme
        env_theme = self.environmental_themes.get(scene_theme, self.environmental_themes["peaceful_village"])
        
        # Generate time-specific details
        time_details = self._get_time_based_details(time_of_day)
        weather_details = self._get_weather_details(weather)
        
        # Build layered description
        base_atmosphere = env_theme["atmosphere"]
        
        if player_approach == "bold":
            perspective = "The scene opens dramatically before you"
        elif player_approach == "sneaky":
            perspective = "You carefully observe the scene, noting every detail"
        else:
            perspective = "The scene unfolds as you take it in"
        
        # Combine elements
        environmental_details = random.sample(env_theme["details"], 2)
        ambient_sounds = random.sample(env_theme["sounds"], 2)
        
        description = f"{perspective}. {base_atmosphere.capitalize()} fills the air. "
        description += f"{time_details} "
        description += f"You notice {environmental_details[0]} and {environmental_details[1]}. "
        description += f"In the distance, you can hear {ambient_sounds[0]} and {ambient_sounds[1]}. "
        description += weather_details
        
        return {
            "description": description,
            "atmosphere": base_atmosphere,
            "key_details": environmental_details,
            "ambient_elements": ambient_sounds,
            "mood": self._determine_mood(context, scene_metadata),
            "sensory_focus": "visual" if time_of_day == "day" else "auditory",
            "immersion_level": "high"
        }

    async def generate_challenge_variation(
        self,
        request: GenerationRequest
    ) -> Dict[str, Any]:
        """Generate dynamic challenge variations based on player performance."""
        context = request.context
        player_history = request.player_history
        
        confidence_score = player_history.get("confidence_score", 5.0)
        recent_failures = player_history.get("recent_failures", 0)
        recent_successes = player_history.get("recent_successes", 0)
        
        base_difficulty = context.get("base_difficulty", 12)
        
        # Dynamic difficulty adjustment
        if confidence_score < 4.0 or recent_failures > recent_successes:
            difficulty_modifier = -2
            hint_level = "obvious"
            encouragement = "Remember, sometimes the simplest approach works best."
        elif confidence_score > 7.0 or recent_successes > recent_failures + 1:
            difficulty_modifier = 1
            hint_level = "subtle"
            encouragement = "You're ready for a real challenge!"
        else:
            difficulty_modifier = 0
            hint_level = "moderate"
            encouragement = "Trust your instincts on this one."
        
        adjusted_difficulty = max(8, min(18, base_difficulty + difficulty_modifier))
        
        # Generate alternative approaches
        alternative_approaches = self._generate_alternative_approaches(context, hint_level)
        
        return {
            "adjusted_difficulty": adjusted_difficulty,
            "original_difficulty": base_difficulty,
            "difficulty_reason": f"Adjusted based on confidence score of {confidence_score}",
            "hint_level": hint_level,
            "encouragement": encouragement,
            "alternative_approaches": alternative_approaches,
            "success_indicators": self._generate_success_indicators(adjusted_difficulty),
            "failure_mitigation": "Even if this doesn't go perfectly, there are other ways to succeed"
        }

    async def generate_reward_description(
        self,
        request: GenerationRequest
    ) -> Dict[str, Any]:
        """Generate engaging reward descriptions."""
        context = request.context
        player_history = request.player_history
        
        reward_type = context.get("reward_type", "experience")
        success_level = context.get("success_level", "success")
        creativity_bonus = context.get("creativity_used", False)
        
        confidence_score = player_history.get("confidence_score", 5.0)
        
        # Base reward descriptions
        if reward_type == "experience":
            base_rewards = [
                "You feel more confident in your abilities",
                "This experience teaches you valuable lessons",
                "Your understanding of adventure deepens",
                "You gain insight into problem-solving"
            ]
        elif reward_type == "story":
            base_rewards = [
                "This becomes a story you'll remember",
                "You've created a memorable moment",
                "This adventure adds to your growing legend",
                "Your actions will be talked about"
            ]
        else:
            base_rewards = [
                "Your efforts are well rewarded",
                "Success brings its own satisfaction",
                "Your persistence pays off",
                "You've earned recognition for your efforts"
            ]
        
        base_reward = random.choice(base_rewards)
        
        # Add success level modifications
        if success_level == "critical_success":
            base_reward = f"Outstanding! {base_reward} in a truly exceptional way."
        elif success_level == "success":
            base_reward = f"{base_reward}."
        elif success_level == "partial_success":
            base_reward = f"{base_reward}, though not quite as planned."
        
        # Add creativity bonus
        if creativity_bonus:
            base_reward += " Your creative approach impresses everyone involved."
        
        # Confidence-based additions
        if confidence_score < 5.0:
            confidence_boost = " This success helps build your confidence as an adventurer."
        elif confidence_score > 7.0:
            confidence_boost = " Your growing reputation as a capable adventurer is well-deserved."
        else:
            confidence_boost = " You're developing the instincts of a true adventurer."
        
        return {
            "description": base_reward + confidence_boost,
            "reward_type": reward_type,
            "success_level": success_level,
            "confidence_impact": self._calculate_confidence_impact(success_level, creativity_bonus),
            "narrative_weight": "high" if creativity_bonus else "medium",
            "memorable": success_level in ["critical_success", "critical_failure"]
        }

    async def generate_consequence_narrative(
        self,
        request: GenerationRequest
    ) -> Dict[str, Any]:
        """Generate consequence narratives that teach without punishing."""
        context = request.context
        outcome_type = context.get("outcome_type", "partial_success")
        player_action = context.get("player_action", "")
        
        # Focus on learning opportunities rather than punishment
        if outcome_type == "failure" or outcome_type == "critical_failure":
            learning_narratives = [
                "This doesn't go as planned, but you learn something valuable about {lesson}.",
                "While this approach doesn't work out, you gain insight into {lesson}.",
                "This teaches you an important lesson about {lesson} for next time.",
                "Though unsuccessful, this experience shows you the importance of {lesson}."
            ]
            
            lessons = {
                "investigation": "gathering information before acting",
                "social": "understanding different perspectives",
                "combat": "thinking tactically",
                "stealth": "patience and observation",
                "generic": "considering all your options"
            }
            
            action_type = self._categorize_action(player_action)
            lesson = lessons.get(action_type, lessons["generic"])
            
            narrative = random.choice(learning_narratives).replace("{lesson}", lesson)
            
            return {
                "narrative": narrative,
                "tone": "educational",
                "learning_focus": lesson,
                "encouragement": "Every adventurer learns through experience",
                "next_opportunity": "You'll have another chance to apply what you've learned"
            }
        else:
            # Success narratives
            success_narratives = [
                "Your approach works well, demonstrating your growing understanding of {skill}.",
                "This success shows your developing skill in {skill}.",
                "Your {skill} serves you well in this situation.",
                "This positive outcome reflects your improving {skill}."
            ]
            
            skills = {
                "investigation": "careful observation",
                "social": "interpersonal communication",
                "combat": "tactical thinking",
                "stealth": "patience and timing",
                "generic": "problem-solving abilities"
            }
            
            action_type = self._categorize_action(player_action)
            skill = skills.get(action_type, skills["generic"])
            
            narrative = random.choice(success_narratives).replace("{skill}", skill)
            
            return {
                "narrative": narrative,
                "tone": "affirming",
                "skill_highlighted": skill,
                "confidence_boost": "This success builds your adventuring confidence",
                "momentum": "You're ready for the next challenge"
            }

    def _get_generator_method(self, content_type: ContentType):
        """Get the appropriate generator method for a content type."""
        generators = {
            ContentType.NPC_DIALOGUE: self.generate_npc_dialogue,
            ContentType.SCENE_DESCRIPTION: self.generate_scene_description,
            ContentType.CHALLENGE_VARIATION: self.generate_challenge_variation,
            ContentType.REWARD_DESCRIPTION: self.generate_reward_description,
            ContentType.CONSEQUENCE_NARRATIVE: self.generate_consequence_narrative,
        }
        return generators.get(content_type, self._generate_generic_content)

    def _get_fallback_content(self, content_type: ContentType) -> Dict[str, Any]:
        """Provide fallback content if generation fails."""
        fallbacks = {
            ContentType.NPC_DIALOGUE: {
                "dialogue": "Interesting! Tell me more about your approach.",
                "tone": "neutral",
                "context_awareness": False
            },
            ContentType.SCENE_DESCRIPTION: {
                "description": "The scene unfolds before you, full of possibilities.",
                "atmosphere": "neutral",
                "mood": "anticipatory"
            },
            ContentType.CHALLENGE_VARIATION: {
                "adjusted_difficulty": 12,
                "hint_level": "moderate",
                "encouragement": "You can handle this challenge."
            },
            ContentType.REWARD_DESCRIPTION: {
                "description": "Your efforts are rewarded with valuable experience.",
                "reward_type": "experience",
                "confidence_impact": 0.5
            },
            ContentType.CONSEQUENCE_NARRATIVE: {
                "narrative": "This experience teaches you something valuable.",
                "tone": "neutral",
                "learning_focus": "general experience"
            }
        }
        
        return fallbacks.get(content_type, {"content": "Content generated successfully."})

    def _get_time_based_details(self, time_of_day: str) -> str:
        """Generate time-specific environmental details."""
        time_details = {
            "dawn": "The soft light of dawn bathes everything in gentle hues.",
            "morning": "Morning light streams through, creating interesting shadows.",
            "midday": "The bright midday sun illuminates every detail clearly.",
            "afternoon": "The warm afternoon light gives everything a golden glow.",
            "evening": "Evening shadows stretch long, creating a dramatic atmosphere.",
            "dusk": "The fading light of dusk adds mystery to the scene.",
            "night": "Moonlight and starlight provide subtle illumination."
        }
        return time_details.get(time_of_day, time_details["evening"])

    def _get_weather_details(self, weather: str) -> str:
        """Generate weather-specific details."""
        weather_details = {
            "clear": "The clear sky provides perfect visibility.",
            "cloudy": "Clouds drift overhead, occasionally blocking the light.",
            "rainy": "Gentle rain creates a peaceful, rhythmic backdrop.",
            "stormy": "Distant thunder adds drama to the atmosphere.",
            "foggy": "Light fog adds an air of mystery to everything.",
            "windy": "A steady breeze stirs the air around you."
        }
        return weather_details.get(weather, "")

    def _determine_mood(self, context: Dict[str, Any], scene_metadata: Dict[str, Any]) -> str:
        """Determine the appropriate mood for the scene."""
        player_confidence = context.get("confidence_score", 5.0)
        scene_type = scene_metadata.get("scene_type", "exploration")
        
        if player_confidence > 7.0:
            return "confident"
        elif player_confidence < 4.0:
            return "cautious"
        elif scene_type == "combat":
            return "tense"
        elif scene_type == "social":
            return "engaging"
        else:
            return "curious"

    def _generate_alternative_approaches(self, context: Dict[str, Any], hint_level: str) -> List[str]:
        """Generate alternative approaches based on hint level."""
        base_approaches = [
            "Consider a direct approach",
            "Think about a creative solution",
            "Look for a social solution",
            "Consider the environment",
            "Think about what your character would naturally do"
        ]
        
        if hint_level == "obvious":
            return base_approaches[:3]  # Give fewer, clearer options
        elif hint_level == "subtle":
            return base_approaches + ["Trust your instincts", "Think outside the box"]
        else:
            return base_approaches[:4]

    def _generate_success_indicators(self, difficulty: int) -> List[str]:
        """Generate indicators that help players understand success likelihood."""
        if difficulty <= 10:
            return ["This seems quite manageable", "You feel confident about this approach"]
        elif difficulty <= 15:
            return ["This will require some skill", "Success is possible with good execution"]
        else:
            return ["This is a real challenge", "Success will require both skill and luck"]

    def _categorize_action(self, action: str) -> str:
        """Categorize a player action for appropriate narrative generation."""
        action_lower = action.lower()
        
        if any(word in action_lower for word in ["investigate", "examine", "search", "look"]):
            return "investigation"
        elif any(word in action_lower for word in ["talk", "speak", "convince", "negotiate"]):
            return "social"
        elif any(word in action_lower for word in ["attack", "fight", "combat", "strike"]):
            return "combat"
        elif any(word in action_lower for word in ["sneak", "hide", "quietly", "stealthily"]):
            return "stealth"
        else:
            return "generic"

    def _calculate_confidence_impact(self, success_level: str, creativity_bonus: bool) -> float:
        """Calculate the confidence impact of a reward."""
        base_impacts = {
            "critical_success": 1.5,
            "success": 1.0,
            "partial_success": 0.5,
            "failure": -0.2,
            "critical_failure": -0.5
        }
        
        impact = base_impacts.get(success_level, 0.5)
        
        if creativity_bonus:
            impact += 0.3
        
        return impact

    def _generate_follow_up_options(self, tone: str, context: Dict[str, Any]) -> List[str]:
        """Generate follow-up dialogue options."""
        if tone == "encouraging":
            return [
                "What questions do you have?",
                "Take your time deciding",
                "Remember, there's no wrong choice here"
            ]
        elif tone == "impressed":
            return [
                "Tell me more about your plan",
                "What gave you that idea?",
                "You're thinking like a true adventurer"
            ]
        else:
            return [
                "What's your next step?",
                "How will you proceed?",
                "What are you thinking?"
            ]

    async def _generate_generic_content(self, request: GenerationRequest) -> Dict[str, Any]:
        """Generic content generator for unspecified types."""
        return {
            "content": "Dynamic content generated based on current context.",
            "type": "generic",
            "contextual": True
        }

    def _load_content_templates(self):
        """Load content templates for various generation contexts."""
        # This would typically load from configuration files
        # For now, we'll use the methods above which contain the template logic
        logger.info("Content generation templates loaded")


# Global service instance
_content_generator: Optional[DynamicContentGenerator] = None


async def get_content_generator() -> DynamicContentGenerator:
    """Get the global content generator instance."""
    global _content_generator
    if _content_generator is None:
        _content_generator = DynamicContentGenerator()
    return _content_generator