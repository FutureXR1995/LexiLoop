"""
LexiLoop AI Service
Main FastAPI application for story generation and content validation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

from src.story_generator.generator import StoryGenerator
from src.content_validator.validator import ContentValidator
from src.audio_generator.generator import AudioGenerator

# Load environment variables
load_dotenv()

app = FastAPI(
    title="LexiLoop AI Service",
    description="AI-powered story generation and content validation service",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
story_generator = StoryGenerator()
content_validator = ContentValidator()
audio_generator = AudioGenerator()

# Request/Response models
class GenerateStoryRequest(BaseModel):
    vocabulary: List[str]
    difficulty: int = 1  # 1-5 scale
    story_type: str = "general"
    max_length: int = 800

class StoryResponse(BaseModel):
    content: str
    vocabulary_used: List[str]
    word_count: int
    difficulty: int
    quality_score: float
    audio_url: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    services: dict

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        services={
            "story_generator": "online",
            "content_validator": "online",
            "audio_generator": "online"
        }
    )

@app.post("/generate-story", response_model=StoryResponse)
async def generate_story(request: GenerateStoryRequest):
    """Generate a story with given vocabulary words"""
    try:
        # Validate vocabulary input
        if not request.vocabulary or len(request.vocabulary) == 0:
            raise HTTPException(status_code=400, detail="Vocabulary list cannot be empty")
        
        if len(request.vocabulary) > 20:
            raise HTTPException(status_code=400, detail="Too many vocabulary words (max 20)")
        
        # Generate story
        story = await story_generator.generate_story(
            vocabulary=request.vocabulary,
            difficulty=request.difficulty,
            story_type=request.story_type,
            max_length=request.max_length
        )
        
        # Validate content quality
        is_valid, quality_score = await content_validator.validate(
            story.content, 
            request.vocabulary
        )
        
        if not is_valid:
            raise HTTPException(status_code=500, detail="Generated content quality is insufficient")
        
        # Generate audio (optional)
        audio_url = None
        try:
            audio_url = await audio_generator.generate_audio(story.content)
        except Exception as e:
            # Audio generation is optional, log error but don't fail the request
            print(f"Audio generation failed: {e}")
        
        return StoryResponse(
            content=story.content,
            vocabulary_used=story.vocabulary_used,
            word_count=story.word_count,
            difficulty=story.difficulty,
            quality_score=quality_score,
            audio_url=audio_url
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/test-openai")
async def test_openai():
    """Test OpenAI API connection"""
    try:
        test_result = await story_generator.test_connection()
        return {"status": "success", "message": "OpenAI API connection successful", "result": test_result}
    except Exception as e:
        return {"status": "error", "message": f"OpenAI API connection failed: {str(e)}"}

@app.get("/test-azure-tts")
async def test_azure_tts():
    """Test Azure Text-to-Speech service"""
    try:
        test_result = await audio_generator.test_connection()
        return {"status": "success", "message": "Azure TTS connection successful", "result": test_result}
    except Exception as e:
        return {"status": "error", "message": f"Azure TTS connection failed: {str(e)}"}

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )