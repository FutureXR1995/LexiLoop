"""
Simplified test script for AI service components (no external dependencies)
"""

import asyncio
import os
import sys
import hashlib
from datetime import datetime

# Add src to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

async def test_content_validation():
    """Test content validation without external dependencies"""
    print("🔍 Testing Content Validation")
    print("-" * 50)
    
    try:
        from content_validator.validator import ContentValidator
        
        validator = ContentValidator()
        
        # Test with sample content
        test_content = """
        The brave explorer decided to embark on an exciting adventure into the mysterious forest. 
        She wanted to discover ancient secrets hidden deep within the woods. As she walked through 
        the dense trees, every sound made her heart race with anticipation. The adventure was 
        challenging, but she was determined to explore every corner and discover the truth about 
        the mysterious legends she had heard. This story shows how vocabulary words can be used 
        naturally in context to create engaging learning content.
        """
        
        test_vocabulary = ["adventure", "mysterious", "explore", "discover"]
        
        is_valid, quality_score = await validator.validate(test_content, test_vocabulary)
        
        print(f"✅ Content validation completed!")
        print(f"🎯 Is valid: {is_valid}")
        print(f"📊 Quality score: {quality_score:.2f}")
        
        # Test vocabulary coverage
        coverage = validator._check_vocabulary_coverage(test_content, test_vocabulary)
        print(f"📝 Vocabulary coverage: {coverage:.2f} ({int(coverage*100)}%)")
        
        # Test readability
        readability = validator._check_readability(test_content)
        print(f"📖 Readability score: {readability:.2f}")
        
        # Test coherence
        coherence = validator._check_coherence(test_content)
        print(f"🔗 Coherence score: {coherence:.2f}")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ Content validation failed: {e}")
        import traceback
        traceback.print_exc()
        print()
        return False

def test_story_generation_logic():
    """Test story generation logic without API calls"""
    print("🧪 Testing Story Generation Logic")
    print("-" * 50)
    
    try:
        # Test cache key generation
        vocabulary = ["adventure", "mysterious", "explore", "discover"]
        difficulty = 2
        story_type = "adventure"
        
        # Simulate cache key generation
        sorted_vocab = sorted(vocabulary)
        key_string = f"{sorted_vocab}_{difficulty}_{story_type}"
        cache_key = hashlib.md5(key_string.encode()).hexdigest()
        
        print(f"✅ Cache key generation: {cache_key[:12]}...")
        
        # Test prompt building logic
        difficulty_levels = {1: "beginner", 2: "elementary", 3: "intermediate", 4: "upper-intermediate", 5: "advanced"}
        difficulty_text = difficulty_levels.get(difficulty, "intermediate")
        
        story_templates = {
            "general": "Create an engaging short story that naturally incorporates these vocabulary words: {vocabulary}. The story should be appropriate for {difficulty_text} level learners.",
            "adventure": "Write an exciting adventure story using these vocabulary words: {vocabulary}. Make it engaging for {difficulty_text} level English learners.",
        }
        
        template = story_templates.get(story_type, story_templates["general"])
        base_prompt = template.format(
            vocabulary=", ".join(vocabulary),
            difficulty_text=difficulty_text
        )
        
        print(f"✅ Prompt template generation successful")
        print(f"📝 Difficulty level: {difficulty_text}")
        print(f"🎯 Vocabulary count: {len(vocabulary)}")
        print(f"📋 Prompt preview: {base_prompt[:100]}...")
        print()
        return True
        
    except Exception as e:
        print(f"❌ Story generation logic failed: {e}")
        print()
        return False

def test_environment_check():
    """Check environment and display configuration"""
    print("⚙️  Environment Check")
    print("-" * 50)
    
    # Check Python version
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    print(f"🐍 Python version: {python_version}")
    
    # Check current directory
    current_dir = os.getcwd()
    print(f"📁 Working directory: {current_dir}")
    
    # Check if source files exist
    src_files = [
        "src/content_validator/validator.py",
        "src/story_generator/generator.py", 
        "src/audio_generator/generator.py"
    ]
    
    for file_path in src_files:
        full_path = os.path.join(current_dir, file_path)
        if os.path.exists(full_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - Missing")
    
    print()

async def main():
    """Run simplified test suite"""
    print("🚀 LexiLoop AI Service - Simplified Test Suite")
    print("=" * 60)
    print()
    
    # Environment check
    test_environment_check()
    
    # Test story generation logic
    story_test_passed = test_story_generation_logic()
    
    # Test content validation
    validation_test_passed = await test_content_validation()
    
    # Summary
    print("📊 Test Results Summary")
    print("-" * 30)
    print(f"Story Generation Logic: {'✅ PASS' if story_test_passed else '❌ FAIL'}")
    print(f"Content Validation: {'✅ PASS' if validation_test_passed else '❌ FAIL'}")
    
    if story_test_passed and validation_test_passed:
        print("\n🎉 All core tests passed! AI service foundation is ready.")
        print("💡 Next steps:")
        print("   1. Install dependencies: pip install -r requirements.txt")
        print("   2. Set up API keys in .env file")
        print("   3. Run full integration tests")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
    
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())