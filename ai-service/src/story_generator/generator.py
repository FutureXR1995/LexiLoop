"""
Story Generator Service
Uses OpenAI GPT to generate contextual stories with vocabulary words
"""

import asyncio
import hashlib
import json
import os
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import redis.asyncio as redis
from openai import AsyncOpenAI
from datetime import datetime, timedelta

@dataclass
class Story:
    content: str
    vocabulary_used: List[str]
    word_count: int
    difficulty: int
    story_type: str
    cache_key: str
    created_at: datetime

class StoryGenerator:
    def __init__(self):
        self.openai_client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.redis_client = None
        self._initialize_redis()
        
        # Story templates for different types
        self.story_templates = {
            "general": "Create an engaging short story that naturally incorporates these vocabulary words: {vocabulary}. The story should be appropriate for {difficulty_text} level learners.",
            "adventure": "Write an exciting adventure story using these vocabulary words: {vocabulary}. Make it engaging for {difficulty_text} level English learners.",
            "daily_life": "Create a realistic story about daily life that includes these vocabulary words: {vocabulary}. Keep it suitable for {difficulty_text} level students.",
            "science": "Write an educational science-themed story incorporating these vocabulary words: {vocabulary}. Make it accessible for {difficulty_text} level learners.",
            "history": "Create an interesting historical story that uses these vocabulary words: {vocabulary}. Ensure it's appropriate for {difficulty_text} level students."
        }
        
        self.difficulty_levels = {
            1: "beginner",
            2: "elementary", 
            3: "intermediate",
            4: "upper-intermediate",
            5: "advanced"
        }

    async def _initialize_redis(self):
        """Initialize Redis connection"""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            await self.redis_client.ping()
            print("Redis connection established")
        except Exception as e:
            print(f"Redis connection failed: {e}")
            self.redis_client = None

    def _generate_cache_key(self, vocabulary: List[str], difficulty: int, story_type: str) -> str:
        """Generate a unique cache key for the story parameters"""
        # Sort vocabulary to ensure consistent cache keys
        sorted_vocab = sorted(vocabulary)
        key_string = f"{sorted_vocab}_{difficulty}_{story_type}"
        return hashlib.md5(key_string.encode()).hexdigest()

    async def _get_cached_story(self, cache_key: str) -> Optional[Story]:
        """Retrieve story from cache if available"""
        if not self.redis_client:
            return None
            
        try:
            cached_data = await self.redis_client.get(f"story:{cache_key}")
            if cached_data:
                story_data = json.loads(cached_data)
                return Story(**story_data)
        except Exception as e:
            print(f"Cache retrieval error: {e}")
        
        return None

    async def _cache_story(self, story: Story, expire_hours: int = 24):
        """Cache the generated story"""
        if not self.redis_client:
            return
            
        try:
            story_data = {
                "content": story.content,
                "vocabulary_used": story.vocabulary_used,
                "word_count": story.word_count,
                "difficulty": story.difficulty,
                "story_type": story.story_type,
                "cache_key": story.cache_key,
                "created_at": story.created_at.isoformat()
            }
            
            await self.redis_client.setex(
                f"story:{story.cache_key}",
                timedelta(hours=expire_hours),
                json.dumps(story_data)
            )
        except Exception as e:
            print(f"Cache storage error: {e}")

    def _build_story_prompt(self, vocabulary: List[str], difficulty: int, story_type: str, max_length: int) -> str:
        """Build the prompt for GPT story generation"""
        difficulty_text = self.difficulty_levels.get(difficulty, "intermediate")
        
        template = self.story_templates.get(story_type, self.story_templates["general"])
        base_prompt = template.format(
            vocabulary=", ".join(vocabulary),
            difficulty_text=difficulty_text
        )
        
        detailed_prompt = f"""
{base_prompt}

Requirements:
1. Use ALL the vocabulary words naturally in the story context
2. Keep the story between 300-{max_length} words
3. Make sure the story is coherent and engaging
4. Adjust complexity to match {difficulty_text} reading level
5. Each vocabulary word should appear at least once
6. Make the story self-contained with a clear beginning, middle, and end

Vocabulary words to include: {', '.join(vocabulary)}

Please write the story now:
"""
        return detailed_prompt

    async def generate_story(
        self, 
        vocabulary: List[str], 
        difficulty: int = 1,
        story_type: str = "general",
        max_length: int = 800
    ) -> Story:
        """Generate a story incorporating the given vocabulary words"""
        
        # Generate cache key
        cache_key = self._generate_cache_key(vocabulary, difficulty, story_type)
        
        # Try to get from cache first
        cached_story = await self._get_cached_story(cache_key)
        if cached_story:
            print(f"Story retrieved from cache: {cache_key}")
            return cached_story
        
        # Generate new story
        print(f"Generating new story for vocabulary: {vocabulary}")
        
        try:
            prompt = self._build_story_prompt(vocabulary, difficulty, story_type, max_length)
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Using gpt-4o-mini for cost efficiency
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a creative writing assistant specializing in educational content for English language learners. Write engaging, coherent stories that naturally incorporate vocabulary words."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1200,
                top_p=1.0,
            )
            
            story_content = response.choices[0].message.content.strip()
            
            # Count words
            word_count = len(story_content.split())
            
            # Check which vocabulary words were actually used
            vocabulary_used = []
            story_lower = story_content.lower()
            for word in vocabulary:
                if word.lower() in story_lower:
                    vocabulary_used.append(word)
            
            # Create story object
            story = Story(
                content=story_content,
                vocabulary_used=vocabulary_used,
                word_count=word_count,
                difficulty=difficulty,
                story_type=story_type,
                cache_key=cache_key,
                created_at=datetime.now()
            )
            
            # Cache the story
            await self._cache_story(story)
            
            return story
            
        except Exception as e:
            raise Exception(f"Story generation failed: {str(e)}")

    async def test_connection(self) -> dict:
        """Test OpenAI API connection"""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": "Say 'Hello, LexiLoop!' if you can hear me."}],
                max_tokens=10
            )
            
            return {
                "model": "gpt-4o-mini",
                "response": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens if response.usage else 0
            }
        except Exception as e:
            raise Exception(f"OpenAI connection test failed: {str(e)}")

    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()