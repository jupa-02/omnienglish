import os
from typing import Optional

class AudioTTSService:
    """
    Text-to-Speech synthesis service supporting Web Speech Synthesis API,
    Piper TTS, or Neural cloud voices.
    """

    def get_speech_url(self, text: str, voice: str = "en-US-Standard") -> Optional[str]:
        """
        Generate audio URL or return None to let frontend Web Speech API synthesize in browser.
        """
        return None

audio_tts_service = AudioTTSService()
