"""
Automatic Progression Tracking Service for SPARC Adventures.
Monitors player progress and provides intelligent advancement recommendations.
"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import logging
import json
import asyncio
from collections import defaultdict

logger = logging.getLogger(__name__)


class SkillArea(Enum):
    PROBLEM_SOLVING = "problem_solving"
    SOCIAL_INTERACTION = "social_interaction"
    CREATIVE_THINKING = "creative_thinking"
    LEADERSHIP = "leadership"
    INVESTIGATION = "investigation"
    EMPATHY = "empathy"
    STRATEGIC_THINKING = "strategic_thinking"
    PATIENCE = "patience"
    COMMUNICATION = "communication"
    DECISION_MAKING = "decision_making"


class ProgressionMilestone(Enum):
    FIRST_ADVENTURE = "first_adventure"
    FIRST_SUCCESS = "first_success"
    CREATIVE_SOLUTION = "creative_solution"
    HELPED_OTHERS = "helped_others"
    OVERCAME_CHALLENGE = "overcame_challenge"
    SHOWED_LEADERSHIP = "showed_leadership"
    ASKED_FOR_HELP = "asked_for_help"
    TAUGHT_SOMEONE = "taught_someone"
    SOLVED_MYSTERY = "solved_mystery"
    MADE_FRIEND = "made_friend"


@dataclass
class SkillProgress:
    skill_area: SkillArea
    current_level: float
    experiences: List[Dict[str, Any]] = field(default_factory=list)
    milestone_achievements: List[str] = field(default_factory=list)
    last_improvement: Optional[datetime] = None
    confidence_in_skill: float = 5.0
    
    def add_experience(self, adventure_id: str, scene_id: str, outcome: str, impact: float, description: str):
        """Add a new experience to this skill area."""
        self.experiences.append({
            "adventure_id": adventure_id,
            "scene_id": scene_id,
            "outcome": outcome,
            "impact": impact,
            "description": description,
            "timestamp": datetime.now()
        })
        
        # Update current level based on impact
        self.current_level = min(10.0, max(0.0, self.current_level + impact))
        self.last_improvement = datetime.now()
        
        # Update confidence based on success
        if outcome in ["success", "critical_success"]:
            self.confidence_in_skill = min(10.0, self.confidence_in_skill + impact * 0.5)
        elif outcome in ["failure", "critical_failure"]:
            self.confidence_in_skill = max(1.0, self.confidence_in_skill - impact * 0.2)


@dataclass
class AdventureSummary:
    adventure_id: str
    session_id: str
    title: str
    difficulty_level: str
    completed_at: datetime
    total_time_minutes: int
    final_confidence_score: float
    total_progress_points: int
    scenes_completed: int
    total_scenes: int
    key_decisions: List[Dict[str, Any]]
    skills_developed: Dict[str, float]
    milestones_achieved: List[str]
    learning_outcomes: List[str]
    memorable_moments: List[str]
    areas_for_growth: List[str]


@dataclass
class PlayerProgression:
    user_id: str
    overall_level: float = 1.0
    total_adventures: int = 0
    total_play_time_hours: float = 0.0
    skill_progress: Dict[SkillArea, SkillProgress] = field(default_factory=dict)
    adventure_history: List[AdventureSummary] = field(default_factory=list)
    milestone_achievements: Dict[ProgressionMilestone, datetime] = field(default_factory=dict)
    preferred_play_style: Dict[str, float] = field(default_factory=dict)
    confidence_trend: List[Tuple[datetime, float]] = field(default_factory=list)
    social_connections: List[str] = field(default_factory=list)
    teaching_opportunities: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    last_activity: datetime = field(default_factory=datetime.now)


class AutomaticProgressionTracker:
    def __init__(self):
        self.player_progressions: Dict[str, PlayerProgression] = {}
        self.skill_mappings = {
            # Map adventure actions to skill areas
            "investigate": [SkillArea.PROBLEM_SOLVING, SkillArea.INVESTIGATION],
            "negotiate": [SkillArea.SOCIAL_INTERACTION, SkillArea.COMMUNICATION],
            "creative_solution": [SkillArea.CREATIVE_THINKING, SkillArea.PROBLEM_SOLVING],
            "leadership": [SkillArea.LEADERSHIP, SkillArea.COMMUNICATION],
            "help_others": [SkillArea.EMPATHY, SkillArea.SOCIAL_INTERACTION],
            "strategic_thinking": [SkillArea.STRATEGIC_THINKING, SkillArea.DECISION_MAKING],
            "patience": [SkillArea.PATIENCE, SkillArea.STRATEGIC_THINKING],
            "ask_for_help": [SkillArea.COMMUNICATION, SkillArea.EMPATHY]
        }

    async def track_adventure_completion(
        self,
        user_id: str,
        adventure_data: Dict[str, Any],
        session_progress: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Track completion of an adventure and update player progression."""
        if user_id not in self.player_progressions:
            self.player_progressions[user_id] = PlayerProgression(user_id=user_id)
        
        player = self.player_progressions[user_id]
        
        # Create adventure summary
        adventure_summary = self._create_adventure_summary(adventure_data, session_progress)
        player.adventure_history.append(adventure_summary)
        
        # Update overall progression metrics
        player.total_adventures += 1
        player.total_play_time_hours += adventure_summary.total_time_minutes / 60
        player.last_activity = datetime.now()
        
        # Track confidence progression
        player.confidence_trend.append((datetime.now(), adventure_summary.final_confidence_score))
        
        # Update skill progressions
        skills_developed = await self._analyze_skills_developed(adventure_data, session_progress)
        for skill_area, impact in skills_developed.items():
            if skill_area not in player.skill_progress:
                player.skill_progress[skill_area] = SkillProgress(skill_area=skill_area, current_level=1.0)
            
            player.skill_progress[skill_area].add_experience(
                adventure_summary.adventure_id,
                "overall",
                "completed",
                impact,
                f"Completed adventure: {adventure_summary.title}"
            )
        
        # Check for milestone achievements
        new_milestones = await self._check_milestone_achievements(player, adventure_summary)
        
        # Update overall level based on progression
        player.overall_level = self._calculate_overall_level(player)
        
        # Analyze play style preferences
        player.preferred_play_style = self._analyze_play_style(player)
        
        return {
            "progression_update": {
                "overall_level": player.overall_level,
                "new_milestones": new_milestones,
                "skills_developed": {skill.value: impact for skill, impact in skills_developed.items()},
                "next_recommendations": await self._generate_recommendations(player)
            },
            "adventure_summary": adventure_summary
        }

    async def track_scene_outcome(
        self,
        user_id: str,
        scene_data: Dict[str, Any],
        outcome_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Track individual scene outcomes for granular progression analysis."""
        if user_id not in self.player_progressions:
            self.player_progressions[user_id] = PlayerProgression(user_id=user_id)
        
        player = self.player_progressions[user_id]
        
        # Analyze the scene for skill development
        skills_used = self._identify_skills_used(scene_data, outcome_data)
        
        for skill_area, impact in skills_used.items():
            if skill_area not in player.skill_progress:
                player.skill_progress[skill_area] = SkillProgress(skill_area=skill_area, current_level=1.0)
            
            player.skill_progress[skill_area].add_experience(
                scene_data.get("adventure_id", "unknown"),
                scene_data.get("scene_id", "unknown"),
                outcome_data.get("outcome_type", "unknown"),
                impact,
                outcome_data.get("description", "Scene completed")
            )
        
        return {
            "skills_developed": {skill.value: impact for skill, impact in skills_used.items()},
            "current_skill_levels": {
                skill.value: progress.current_level 
                for skill, progress in player.skill_progress.items()
            }
        }

    async def get_player_progression(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive progression data for a player."""
        if user_id not in self.player_progressions:
            return None
        
        player = self.player_progressions[user_id]
        
        return {
            "user_id": player.user_id,
            "overall_level": player.overall_level,
            "total_adventures": player.total_adventures,
            "total_play_time_hours": player.total_play_time_hours,
            "skill_levels": {
                skill.value: {
                    "current_level": progress.current_level,
                    "confidence": progress.confidence_in_skill,
                    "experiences_count": len(progress.experiences),
                    "last_improvement": progress.last_improvement.isoformat() if progress.last_improvement else None
                }
                for skill, progress in player.skill_progress.items()
            },
            "milestone_achievements": {
                milestone.value: timestamp.isoformat()
                for milestone, timestamp in player.milestone_achievements.items()
            },
            "preferred_play_style": player.preferred_play_style,
            "confidence_trend": [
                {"timestamp": ts.isoformat(), "confidence": conf}
                for ts, conf in player.confidence_trend[-10:]  # Last 10 entries
            ],
            "recent_adventures": [
                {
                    "title": adv.title,
                    "difficulty": adv.difficulty_level,
                    "completion_date": adv.completed_at.isoformat(),
                    "confidence_score": adv.final_confidence_score,
                    "key_learnings": adv.learning_outcomes
                }
                for adv in player.adventure_history[-5:]  # Last 5 adventures
            ],
            "recommendations": await self._generate_recommendations(player),
            "created_at": player.created_at.isoformat(),
            "last_activity": player.last_activity.isoformat()
        }

    async def get_progression_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get detailed analytics about a player's progression."""
        if user_id not in self.player_progressions:
            return {"error": "No progression data found"}
        
        player = self.player_progressions[user_id]
        
        # Calculate various analytics
        skill_growth_rates = self._calculate_skill_growth_rates(player)
        adventure_preferences = self._analyze_adventure_preferences(player)
        learning_velocity = self._calculate_learning_velocity(player)
        social_impact = self._analyze_social_impact(player)
        
        return {
            "progression_summary": {
                "overall_level": player.overall_level,
                "adventures_completed": player.total_adventures,
                "total_experience_hours": player.total_play_time_hours,
                "milestones_achieved": len(player.milestone_achievements),
                "skills_developed": len(player.skill_progress)
            },
            "skill_analysis": {
                "strongest_skills": self._get_strongest_skills(player, 3),
                "developing_skills": self._get_developing_skills(player, 3),
                "growth_rates": skill_growth_rates,
                "confidence_by_skill": {
                    skill.value: progress.confidence_in_skill
                    for skill, progress in player.skill_progress.items()
                }
            },
            "learning_patterns": {
                "preferred_difficulty": adventure_preferences.get("difficulty_preference"),
                "preferred_themes": adventure_preferences.get("theme_preferences", []),
                "learning_velocity": learning_velocity,
                "consistency_score": self._calculate_consistency_score(player)
            },
            "social_development": {
                "teaching_opportunities": player.teaching_opportunities,
                "social_connections": len(player.social_connections),
                "leadership_growth": skill_growth_rates.get(SkillArea.LEADERSHIP, 0),
                "empathy_development": skill_growth_rates.get(SkillArea.EMPATHY, 0)
            },
            "future_outlook": {
                "recommended_next_level": self._recommend_next_difficulty(player),
                "skill_focus_areas": await self._identify_growth_opportunities(player),
                "milestone_progress": await self._assess_milestone_progress(player)
            }
        }

    def _create_adventure_summary(
        self,
        adventure_data: Dict[str, Any],
        session_progress: Dict[str, Any]
    ) -> AdventureSummary:
        """Create a comprehensive summary of an adventure experience."""
        return AdventureSummary(
            adventure_id=adventure_data.get("adventure_id", "unknown"),
            session_id=session_progress.get("session_id", "unknown"),
            title=adventure_data.get("title", "Unknown Adventure"),
            difficulty_level=adventure_data.get("difficulty_level", "newcomer"),
            completed_at=datetime.now(),
            total_time_minutes=session_progress.get("time_spent_minutes", 0),
            final_confidence_score=session_progress.get("confidence_score", 5.0),
            total_progress_points=session_progress.get("total_progress_points", 0),
            scenes_completed=len(session_progress.get("completed_scenes", [])),
            total_scenes=len(adventure_data.get("scenes", [])),
            key_decisions=session_progress.get("key_decisions", []),
            skills_developed={},  # Will be populated by analysis
            milestones_achieved=[],  # Will be populated by milestone check
            learning_outcomes=adventure_data.get("learning_objectives", []),
            memorable_moments=session_progress.get("memorable_moments", []),
            areas_for_growth=[]  # Will be populated by analysis
        )

    async def _analyze_skills_developed(
        self,
        adventure_data: Dict[str, Any],
        session_progress: Dict[str, Any]
    ) -> Dict[SkillArea, float]:
        """Analyze which skills were developed during an adventure."""
        skills_developed = defaultdict(float)
        
        # Analyze completed scenes for skill usage
        completed_scenes = session_progress.get("completed_scenes", [])
        scene_outcomes = session_progress.get("scene_outcomes", {})
        
        for scene_id in completed_scenes:
            outcome = scene_outcomes.get(scene_id, "success")
            
            # Base skill development for completion
            skills_developed[SkillArea.DECISION_MAKING] += 0.2
            
            # Outcome-specific skill development
            if outcome in ["success", "critical_success"]:
                skills_developed[SkillArea.PROBLEM_SOLVING] += 0.3
            elif outcome == "critical_success":
                skills_developed[SkillArea.CREATIVE_THINKING] += 0.5
        
        # Adventure theme-specific skills
        theme = adventure_data.get("theme", "").lower()
        if "social" in theme or "merchant" in theme:
            skills_developed[SkillArea.SOCIAL_INTERACTION] += 0.4
            skills_developed[SkillArea.EMPATHY] += 0.3
        elif "mystery" in theme or "investigation" in theme:
            skills_developed[SkillArea.INVESTIGATION] += 0.4
            skills_developed[SkillArea.PATIENCE] += 0.3
        elif "leadership" in theme or "community" in theme:
            skills_developed[SkillArea.LEADERSHIP] += 0.4
            skills_developed[SkillArea.COMMUNICATION] += 0.3
        
        # Confidence-based adjustments
        final_confidence = session_progress.get("confidence_score", 5.0)
        confidence_multiplier = min(1.5, max(0.5, final_confidence / 6.0))
        
        return {skill: impact * confidence_multiplier for skill, impact in skills_developed.items()}

    def _identify_skills_used(
        self,
        scene_data: Dict[str, Any],
        outcome_data: Dict[str, Any]
    ) -> Dict[SkillArea, float]:
        """Identify skills used in a specific scene."""
        skills_used = defaultdict(float)
        
        action_taken = scene_data.get("action_taken", "").lower()
        scene_type = scene_data.get("scene_type", "").lower()
        outcome = outcome_data.get("outcome_type", "success")
        
        # Map actions to skills
        skill_mappings = {
            "investigate": [SkillArea.INVESTIGATION, SkillArea.PROBLEM_SOLVING],
            "negotiate": [SkillArea.SOCIAL_INTERACTION, SkillArea.COMMUNICATION],
            "help": [SkillArea.EMPATHY, SkillArea.SOCIAL_INTERACTION],
            "creative": [SkillArea.CREATIVE_THINKING, SkillArea.PROBLEM_SOLVING],
            "lead": [SkillArea.LEADERSHIP, SkillArea.COMMUNICATION],
            "patient": [SkillArea.PATIENCE, SkillArea.STRATEGIC_THINKING],
            "ask": [SkillArea.COMMUNICATION, SkillArea.EMPATHY]
        }
        
        # Apply skill mappings based on action
        for keyword, skill_list in skill_mappings.items():
            if keyword in action_taken:
                for skill in skill_list:
                    skills_used[skill] += 0.3
        
        # Scene type bonuses
        if scene_type == "social":
            skills_used[SkillArea.SOCIAL_INTERACTION] += 0.2
            skills_used[SkillArea.COMMUNICATION] += 0.2
        elif scene_type == "challenge":
            skills_used[SkillArea.PROBLEM_SOLVING] += 0.2
            skills_used[SkillArea.STRATEGIC_THINKING] += 0.2
        elif scene_type == "exploration":
            skills_used[SkillArea.INVESTIGATION] += 0.2
            skills_used[SkillArea.PATIENCE] += 0.1
        
        # Outcome adjustments
        outcome_multipliers = {
            "critical_success": 1.5,
            "success": 1.0,
            "partial_success": 0.8,
            "failure": 0.5,
            "critical_failure": 0.3
        }
        
        multiplier = outcome_multipliers.get(outcome, 1.0)
        return {skill: impact * multiplier for skill, impact in skills_used.items()}

    async def _check_milestone_achievements(
        self,
        player: PlayerProgression,
        adventure_summary: AdventureSummary
    ) -> List[str]:
        """Check for new milestone achievements."""
        new_milestones = []
        
        # First adventure milestone
        if (player.total_adventures == 1 and 
            ProgressionMilestone.FIRST_ADVENTURE not in player.milestone_achievements):
            player.milestone_achievements[ProgressionMilestone.FIRST_ADVENTURE] = datetime.now()
            new_milestones.append("first_adventure")
        
        # Success-based milestones
        if (adventure_summary.final_confidence_score >= 7.0 and
            ProgressionMilestone.FIRST_SUCCESS not in player.milestone_achievements):
            player.milestone_achievements[ProgressionMilestone.FIRST_SUCCESS] = datetime.now()
            new_milestones.append("first_success")
        
        # Creative solution milestone
        if (SkillArea.CREATIVE_THINKING in player.skill_progress and
            player.skill_progress[SkillArea.CREATIVE_THINKING].current_level >= 5.0 and
            ProgressionMilestone.CREATIVE_SOLUTION not in player.milestone_achievements):
            player.milestone_achievements[ProgressionMilestone.CREATIVE_SOLUTION] = datetime.now()
            new_milestones.append("creative_solution")
        
        # Leadership milestone
        if (SkillArea.LEADERSHIP in player.skill_progress and
            player.skill_progress[SkillArea.LEADERSHIP].current_level >= 6.0 and
            ProgressionMilestone.SHOWED_LEADERSHIP not in player.milestone_achievements):
            player.milestone_achievements[ProgressionMilestone.SHOWED_LEADERSHIP] = datetime.now()
            new_milestones.append("showed_leadership")
        
        # Helper milestone
        if (SkillArea.EMPATHY in player.skill_progress and
            player.skill_progress[SkillArea.EMPATHY].current_level >= 5.0 and
            ProgressionMilestone.HELPED_OTHERS not in player.milestone_achievements):
            player.milestone_achievements[ProgressionMilestone.HELPED_OTHERS] = datetime.now()
            new_milestones.append("helped_others")
        
        return new_milestones

    def _calculate_overall_level(self, player: PlayerProgression) -> float:
        """Calculate overall player level based on various factors."""
        base_level = 1.0
        
        # Adventure completion bonus
        adventure_bonus = min(5.0, player.total_adventures * 0.5)
        
        # Skill development bonus
        skill_bonus = 0.0
        if player.skill_progress:
            avg_skill_level = sum(skill.current_level for skill in player.skill_progress.values()) / len(player.skill_progress)
            skill_bonus = min(3.0, (avg_skill_level - 1.0) * 0.5)
        
        # Milestone bonus
        milestone_bonus = min(2.0, len(player.milestone_achievements) * 0.3)
        
        # Consistency bonus (regular play)
        consistency_bonus = min(1.0, self._calculate_consistency_score(player))
        
        return min(10.0, base_level + adventure_bonus + skill_bonus + milestone_bonus + consistency_bonus)

    async def _generate_recommendations(self, player: PlayerProgression) -> List[Dict[str, Any]]:
        """Generate personalized recommendations for continued growth."""
        recommendations = []
        
        # Adventure difficulty recommendation
        current_avg_confidence = self._get_average_confidence(player)
        if current_avg_confidence >= 8.0:
            recommendations.append({
                "type": "challenge_increase",
                "title": "Ready for Greater Challenges",
                "description": "Your confidence is high! Try a more challenging adventure.",
                "action": "Try an intermediate-level adventure",
                "priority": "high"
            })
        elif current_avg_confidence < 6.0:
            recommendations.append({
                "type": "confidence_building",
                "title": "Build Your Confidence",
                "description": "Focus on adventures that match your current skill level.",
                "action": "Try another newcomer or beginner adventure",
                "priority": "high"
            })
        
        # Skill development recommendations
        weakest_skills = self._get_weakest_skills(player, 2)
        for skill in weakest_skills:
            skill_name = skill.value.replace('_', ' ').title()
            recommendations.append({
                "type": "skill_development",
                "title": f"Develop {skill_name}",
                "description": f"Look for adventures that challenge your {skill_name.lower()} abilities.",
                "action": f"Focus on {skill_name.lower()} in your next adventure",
                "priority": "medium"
            })
        
        # Social recommendations
        if len(player.social_connections) < 3:
            recommendations.append({
                "type": "social_growth",
                "title": "Connect with Other Players",
                "description": "RPGs are more fun with friends! Consider finding a regular group.",
                "action": "Look for local gaming groups or online communities",
                "priority": "medium"
            })
        
        # Milestone recommendations
        upcoming_milestones = await self._identify_upcoming_milestones(player)
        for milestone in upcoming_milestones[:2]:  # Top 2 upcoming milestones
            recommendations.append({
                "type": "milestone_progress",
                "title": f"Achieve {milestone['title']}",
                "description": milestone["description"],
                "action": milestone["action"],
                "priority": "low"
            })
        
        return recommendations

    def _get_strongest_skills(self, player: PlayerProgression, count: int) -> List[Tuple[SkillArea, float]]:
        """Get the player's strongest skills."""
        if not player.skill_progress:
            return []
        
        sorted_skills = sorted(
            player.skill_progress.items(),
            key=lambda x: x[1].current_level,
            reverse=True
        )
        return [(skill, progress.current_level) for skill, progress in sorted_skills[:count]]

    def _get_weakest_skills(self, player: PlayerProgression, count: int) -> List[SkillArea]:
        """Get the player's weakest skill areas."""
        if not player.skill_progress:
            return list(SkillArea)[:count]  # Return first few skill areas if no progress yet
        
        sorted_skills = sorted(
            player.skill_progress.items(),
            key=lambda x: x[1].current_level
        )
        return [skill for skill, _ in sorted_skills[:count]]

    def _get_developing_skills(self, player: PlayerProgression, count: int) -> List[Tuple[SkillArea, float]]:
        """Get skills that are actively being developed."""
        if not player.skill_progress:
            return []
        
        # Skills with recent improvement and mid-range levels
        developing = []
        for skill, progress in player.skill_progress.items():
            if (progress.last_improvement and 
                (datetime.now() - progress.last_improvement).days < 30 and
                2.0 <= progress.current_level <= 7.0):
                developing.append((skill, progress.current_level))
        
        developing.sort(key=lambda x: x[1], reverse=True)
        return developing[:count]

    def _calculate_skill_growth_rates(self, player: PlayerProgression) -> Dict[SkillArea, float]:
        """Calculate growth rates for each skill area."""
        growth_rates = {}
        
        for skill, progress in player.skill_progress.items():
            if len(progress.experiences) < 2:
                growth_rates[skill] = 0.0
                continue
            
            # Calculate growth over time
            first_experience = progress.experiences[0]
            last_experience = progress.experiences[-1]
            
            time_diff = (last_experience["timestamp"] - first_experience["timestamp"]).total_seconds() / 3600  # hours
            level_diff = progress.current_level - 1.0  # Assuming starting level of 1.0
            
            if time_diff > 0:
                growth_rates[skill] = level_diff / time_diff
            else:
                growth_rates[skill] = 0.0
        
        return growth_rates

    def _analyze_adventure_preferences(self, player: PlayerProgression) -> Dict[str, Any]:
        """Analyze player's adventure preferences."""
        if not player.adventure_history:
            return {"difficulty_preference": "newcomer", "theme_preferences": []}
        
        # Analyze difficulty preferences
        difficulty_scores = defaultdict(list)
        theme_frequencies = defaultdict(int)
        
        for adventure in player.adventure_history:
            difficulty_scores[adventure.difficulty_level].append(adventure.final_confidence_score)
            theme_frequencies[adventure.title.split()[0]] += 1  # Simple theme extraction
        
        # Find preferred difficulty (highest average confidence)
        preferred_difficulty = max(
            difficulty_scores.items(),
            key=lambda x: sum(x[1]) / len(x[1])
        )[0] if difficulty_scores else "newcomer"
        
        # Most frequent themes
        preferred_themes = sorted(theme_frequencies.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "difficulty_preference": preferred_difficulty,
            "theme_preferences": [theme for theme, _ in preferred_themes[:3]]
        }

    def _calculate_learning_velocity(self, player: PlayerProgression) -> float:
        """Calculate how quickly the player learns and improves."""
        if player.total_play_time_hours < 1.0:
            return 0.0
        
        total_skill_growth = sum(
            progress.current_level - 1.0 
            for progress in player.skill_progress.values()
        )
        
        return total_skill_growth / player.total_play_time_hours

    def _calculate_consistency_score(self, player: PlayerProgression) -> float:
        """Calculate consistency score based on regular play patterns."""
        if len(player.adventure_history) < 2:
            return 0.0
        
        # Calculate average time between adventures
        time_gaps = []
        for i in range(1, len(player.adventure_history)):
            gap = (player.adventure_history[i].completed_at - 
                   player.adventure_history[i-1].completed_at).days
            time_gaps.append(gap)
        
        if not time_gaps:
            return 0.0
        
        avg_gap = sum(time_gaps) / len(time_gaps)
        
        # Score based on consistency (lower gaps = higher consistency)
        if avg_gap <= 7:  # Weekly play
            return 1.0
        elif avg_gap <= 14:  # Bi-weekly play
            return 0.8
        elif avg_gap <= 30:  # Monthly play
            return 0.6
        else:
            return 0.3

    def _analyze_social_impact(self, player: PlayerProgression) -> Dict[str, Any]:
        """Analyze the player's social development and impact."""
        return {
            "connections_made": len(player.social_connections),
            "teaching_provided": player.teaching_opportunities,
            "leadership_development": player.skill_progress.get(SkillArea.LEADERSHIP, SkillProgress(SkillArea.LEADERSHIP, 1.0)).current_level,
            "empathy_growth": player.skill_progress.get(SkillArea.EMPATHY, SkillProgress(SkillArea.EMPATHY, 1.0)).current_level
        }

    def _recommend_next_difficulty(self, player: PlayerProgression) -> str:
        """Recommend the next difficulty level for the player."""
        avg_confidence = self._get_average_confidence(player)
        overall_level = player.overall_level
        
        if avg_confidence >= 8.0 and overall_level >= 5.0:
            return "intermediate"
        elif avg_confidence >= 6.5 and overall_level >= 3.0:
            return "beginner"
        else:
            return "newcomer"

    async def _identify_growth_opportunities(self, player: PlayerProgression) -> List[str]:
        """Identify specific areas for skill growth."""
        opportunities = []
        
        # Find underdeveloped skills
        all_skills = set(SkillArea)
        developed_skills = set(player.skill_progress.keys())
        undeveloped_skills = all_skills - developed_skills
        
        for skill in list(undeveloped_skills)[:3]:
            opportunities.append(skill.value.replace('_', ' ').title())
        
        # Find skills with low confidence despite decent level
        for skill, progress in player.skill_progress.items():
            if progress.current_level >= 4.0 and progress.confidence_in_skill < 5.0:
                opportunities.append(f"{skill.value.replace('_', ' ').title()} (confidence building)")
        
        return opportunities[:5]  # Limit to 5 opportunities

    async def _assess_milestone_progress(self, player: PlayerProgression) -> Dict[str, float]:
        """Assess progress toward upcoming milestones."""
        milestone_progress = {}
        
        # Check progress toward each milestone
        all_milestones = list(ProgressionMilestone)
        achieved_milestones = set(player.milestone_achievements.keys())
        
        for milestone in all_milestones:
            if milestone in achieved_milestones:
                continue
            
            progress = 0.0
            
            if milestone == ProgressionMilestone.FIRST_ADVENTURE:
                progress = 100.0 if player.total_adventures > 0 else 0.0
            elif milestone == ProgressionMilestone.FIRST_SUCCESS:
                avg_confidence = self._get_average_confidence(player)
                progress = min(100.0, (avg_confidence / 7.0) * 100)
            elif milestone == ProgressionMilestone.CREATIVE_SOLUTION:
                creative_level = player.skill_progress.get(SkillArea.CREATIVE_THINKING, SkillProgress(SkillArea.CREATIVE_THINKING, 1.0)).current_level
                progress = min(100.0, (creative_level / 5.0) * 100)
            elif milestone == ProgressionMilestone.SHOWED_LEADERSHIP:
                leadership_level = player.skill_progress.get(SkillArea.LEADERSHIP, SkillProgress(SkillArea.LEADERSHIP, 1.0)).current_level
                progress = min(100.0, (leadership_level / 6.0) * 100)
            elif milestone == ProgressionMilestone.HELPED_OTHERS:
                empathy_level = player.skill_progress.get(SkillArea.EMPATHY, SkillProgress(SkillArea.EMPATHY, 1.0)).current_level
                progress = min(100.0, (empathy_level / 5.0) * 100)
            
            milestone_progress[milestone.value] = progress
        
        return milestone_progress

    async def _identify_upcoming_milestones(self, player: PlayerProgression) -> List[Dict[str, str]]:
        """Identify milestones the player is close to achieving."""
        milestone_progress = await self._assess_milestone_progress(player)
        
        # Find milestones with > 50% progress
        upcoming = []
        for milestone_name, progress in milestone_progress.items():
            if progress >= 50.0:
                milestone_info = self._get_milestone_info(milestone_name)
                upcoming.append(milestone_info)
        
        return sorted(upcoming, key=lambda x: milestone_progress[x["milestone"]], reverse=True)

    def _get_milestone_info(self, milestone_name: str) -> Dict[str, str]:
        """Get information about a specific milestone."""
        milestone_info = {
            "first_adventure": {
                "title": "First Adventure",
                "description": "Complete your first SPARC adventure",
                "action": "Start any adventure to achieve this milestone"
            },
            "first_success": {
                "title": "First Success",
                "description": "Complete an adventure with high confidence",
                "action": "Focus on making thoughtful decisions to build confidence"
            },
            "creative_solution": {
                "title": "Creative Problem Solver",
                "description": "Develop strong creative thinking skills",
                "action": "Look for unique and creative solutions to challenges"
            },
            "showed_leadership": {
                "title": "Natural Leader",
                "description": "Demonstrate leadership abilities in adventures",
                "action": "Take initiative and help guide group decisions"
            },
            "helped_others": {
                "title": "Helpful Companion",
                "description": "Show empathy and help others in need",
                "action": "Look for opportunities to assist and support others"
            }
        }
        
        return milestone_info.get(milestone_name, {
            "title": "Unknown Milestone",
            "description": "Continue playing to discover more milestones",
            "action": "Keep adventuring!"
        })

    def _get_average_confidence(self, player: PlayerProgression) -> float:
        """Get the player's average confidence score across adventures."""
        if not player.adventure_history:
            return 5.0
        
        total_confidence = sum(adv.final_confidence_score for adv in player.adventure_history)
        return total_confidence / len(player.adventure_history)


# Global service instance
_progression_tracker: Optional[AutomaticProgressionTracker] = None


async def get_progression_tracker() -> AutomaticProgressionTracker:
    """Get the global progression tracker instance."""
    global _progression_tracker
    if _progression_tracker is None:
        _progression_tracker = AutomaticProgressionTracker()
    return _progression_tracker