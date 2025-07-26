"""
Test script for AI service components
Run this to verify AI service integration without API keys
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_story_generation_mock():
    """Test story generation with mock data (no API key required)"""
    print("🧪 Testing Story Generation (Mock Mode)")
    print("-" * 50)
    
    # Mock story generator
    class MockStoryGenerator:
        async def generate_story(self, vocabulary, difficulty=1, story_type="general", max_length=800):
            # Simple mock story generation
            vocab_str = ", ".join(vocabulary)
            mock_story = f"""
Once upon a time, there was a young student who loved to learn new words. Today, the student decided to study some important vocabulary: {vocab_str}.

The student opened a book and began to read. Each word seemed to {vocabulary[0] if vocabulary else 'shine'} with meaning. The story was {vocabulary[1] if len(vocabulary) > 1 else 'interesting'} and helped the student understand how these words could be used in everyday situations.

As the day ended, the student felt {vocabulary[2] if len(vocabulary) > 2 else 'confident'} about using these new words. This experience taught the student that learning vocabulary through stories makes the process much more {vocabulary[3] if len(vocabulary) > 3 else 'enjoyable'}.

The student smiled, knowing that tomorrow would bring even more opportunities to learn and grow.
            """.strip()
            
            from dataclasses import dataclass
            from datetime import datetime
            
            @dataclass
            class MockStory:
                content: str
                vocabulary_used: list
                word_count: int
                difficulty: int
                story_type: str
                cache_key: str
                created_at: datetime
            
            return MockStory(
                content=mock_story,
                vocabulary_used=vocabulary,
                word_count=len(mock_story.split()),
                difficulty=difficulty,
                story_type=story_type,
                cache_key="mock_key",
                created_at=datetime.now()
            )
    
    # Test with sample vocabulary
    test_vocabulary = ["adventure", "mysterious", "explore", "discover"]
    generator = MockStoryGenerator()
    
    try:
        story = await generator.generate_story(
            vocabulary=test_vocabulary,
            difficulty=2,
            story_type="adventure"
        )
        
        print(f"✅ Story generated successfully!")
        print(f"📝 Word count: {story.word_count}")
        print(f"🎯 Vocabulary used: {len(story.vocabulary_used)}/{len(test_vocabulary)}")
        print(f"📖 Story preview: {story.content[:200]}...")
        print()
        
    except Exception as e:
        print(f"❌ Story generation failed: {e}")
        print()

async def test_content_validation():
    """Test content validation"""
    print("🔍 Testing Content Validation")
    print("-" * 50)
    
    from src.content_validator.validator import ContentValidator
    
    validator = ContentValidator()
    
    # Test with sample content
    test_content = """
    The brave explorer decided to embark on an exciting adventure into the mysterious forest. 
    She wanted to discover ancient secrets hidden deep within the woods. As she walked through 
    the dense trees, every sound made her heart race with anticipation. The adventure was 
    challenging, but she was determined to explore every corner and discover the truth about 
    the mysterious legends she had heard.
    """
    
    test_vocabulary = ["adventure", "mysterious", "explore", "discover"]
    
    try:
        is_valid, quality_score = await validator.validate(test_content, test_vocabulary)
        
        print(f"✅ Content validation completed!")
        print(f"🎯 Is valid: {is_valid}")
        print(f"📊 Quality score: {quality_score:.2f}")
        print()
        
    except Exception as e:
        print(f"❌ Content validation failed: {e}")
        print()

def test_environment_setup():
    """Test environment configuration"""
    print("⚙️  Testing Environment Setup")
    print("-" * 50)
    
    required_vars = [
        "OPENAI_API_KEY",
        "AZURE_SPEECH_KEY", 
        "AZURE_SPEECH_REGION",
        "REDIS_URL"
    ]
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            masked_value = value[:8] + "..." if len(value) > 8 else "***"
            print(f"✅ {var}: {masked_value}")
        else:
            print(f"⚠️  {var}: Not set (will use mock/default)")
    
    print()

async def test_api_connections():
    """Test actual API connections if keys are available"""
    print("🌐 Testing API Connections")
    print("-" * 50)
    
    # Test OpenAI
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            from src.story_generator.generator import StoryGenerator
            generator = StoryGenerator()
            result = await generator.test_connection()
            print(f"✅ OpenAI API: Connected")
            print(f"   Model: {result.get('model', 'Unknown')}")
            print(f"   Response: {result.get('response', 'No response')[:50]}...")
        except Exception as e:
            print(f"❌ OpenAI API: Failed - {e}")
    else:
        print("⚠️  OpenAI API: No key provided, skipping test")
    
    # Test Azure TTS
    azure_key = os.getenv("AZURE_SPEECH_KEY")
    if azure_key:
        try:
            from src.audio_generator.generator import AudioGenerator
            audio_gen = AudioGenerator()
            result = await audio_gen.test_connection()
            print(f"✅ Azure TTS: Connected")
            print(f"   Voice: {result.get('voice', 'Unknown')}")
            print(f"   Region: {result.get('region', 'Unknown')}")
        except Exception as e:
            print(f"❌ Azure TTS: Failed - {e}")
    else:
        print("⚠️  Azure TTS: No key provided, skipping test")
    
    print()

async def main():
    """Run all tests"""
    print("🚀 LexiLoop AI Service Test Suite")
    print("=" * 60)
    print()
    
    # Test environment
    test_environment_setup()
    
    # Test core functionality (works without API keys)
    await test_story_generation_mock()
    await test_content_validation()
    
    # Test API connections (only if keys are available)
    await test_api_connections()
    
    print("🎉 Test suite completed!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())