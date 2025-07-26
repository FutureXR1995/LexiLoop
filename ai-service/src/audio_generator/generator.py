"""
Audio Generator Service
Uses Azure Text-to-Speech to generate audio for stories
"""

import os
import hashlib
import asyncio
from typing import Optional
import azure.cognitiveservices.speech as speechsdk
from datetime import datetime

class AudioGenerator:
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.speech_region = os.getenv("AZURE_SPEECH_REGION", "eastus")
        
        # Configure speech service
        if self.speech_key:
            self.speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key, 
                region=self.speech_region
            )
            
            # Set voice (can be made configurable)
            self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            
            # Audio format settings
            self.speech_config.set_speech_synthesis_output_format(
                speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
            )
        else:
            self.speech_config = None
            print("Warning: Azure Speech Service not configured")

    async def generate_audio(self, text: str) -> Optional[str]:
        """
        Generate audio file from text using Azure TTS
        Returns the file path/URL of the generated audio
        """
        if not self.speech_config:
            print("Azure TTS not configured, skipping audio generation")
            return None
        
        try:
            # Create unique filename based on text hash
            text_hash = hashlib.md5(text.encode()).hexdigest()[:12]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"story_audio_{timestamp}_{text_hash}.mp3"
            
            # Create audio directory if it doesn't exist
            audio_dir = os.path.join(os.getcwd(), "generated_audio")
            os.makedirs(audio_dir, exist_ok=True)
            
            file_path = os.path.join(audio_dir, filename)
            
            # Configure audio output to file
            audio_config = speechsdk.audio.AudioOutputConfig(filename=file_path)
            
            # Create synthesizer
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            # Run synthesis in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                synthesizer.speak_text, 
                text
            )
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                print(f"Audio synthesized successfully: {filename}")
                
                # Return relative path or URL (in real deployment, this would be a CDN URL)
                return f"/audio/{filename}"
            
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                print(f"Speech synthesis canceled: {cancellation_details.reason}")
                if cancellation_details.error_details:
                    print(f"Error details: {cancellation_details.error_details}")
                return None
                
        except Exception as e:
            print(f"Audio generation error: {e}")
            return None

    async def test_connection(self) -> dict:
        """Test Azure TTS service connection"""
        if not self.speech_config:
            raise Exception("Azure Speech Service not configured")
        
        try:
            # Test with a simple phrase
            test_text = "Hello, this is a test of the LexiLoop audio generation service."
            
            # Use memory stream for testing (don't save file)
            audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=False)
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config,
                audio_config=None  # Output to memory
            )
            
            # Run synthesis
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                synthesizer.speak_text,
                test_text
            )
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                audio_data_length = len(result.audio_data) if result.audio_data else 0
                return {
                    "service": "Azure Text-to-Speech",
                    "voice": self.speech_config.speech_synthesis_voice_name,
                    "region": self.speech_region,
                    "test_text": test_text,
                    "audio_data_size": audio_data_length,
                    "status": "success"
                }
            else:
                cancellation_details = result.cancellation_details
                raise Exception(f"TTS test failed: {cancellation_details.reason}")
                
        except Exception as e:
            raise Exception(f"Azure TTS connection test failed: {str(e)}")

    def get_available_voices(self) -> list:
        """Get list of available voices (for future use)"""
        # This would typically query the Azure service for available voices
        # For now, return a predefined list of good voices for learning
        return [
            {
                "name": "en-US-JennyNeural",
                "gender": "Female",
                "description": "Friendly, clear voice ideal for learning"
            },
            {
                "name": "en-US-DavisNeural", 
                "gender": "Male",
                "description": "Clear, professional voice"
            },
            {
                "name": "en-US-AriaNeural",
                "gender": "Female", 
                "description": "Expressive voice good for storytelling"
            }
        ]