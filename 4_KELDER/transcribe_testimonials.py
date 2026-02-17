import os
import subprocess
import json
import base64
import time

# 🛡️ NUCLEAR TRANSCRIPTION SCRIPT FOR TESTIMONIALS
# Uses OpenAI Whisper to generate atomic subtitles for testimonial videos.

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

VIDEOS = [
    "1-SITE/assets/content/blog/videos/nkc.mp4",
    "1-SITE/assets/content/blog/videos/ticketteam.mp4",
    "1-SITE/assets/content/blog/videos/review-aclvb.mp4",
    "1-SITE/assets/content/blog/videos/review-slv.mp4",
    "1-SITE/assets/content/blog/videos/review-jokershopbe.mp4",
    "1-SITE/assets/content/blog/videos/peter-van-creo.mp4",
    "1-SITE/assets/content/blog/videos/voor-ons-was-dit-een-no-brainer.mp4",
    "1-SITE/assets/content/blog/videos/review-fostplus.mp4",
    "1-SITE/assets/content/blog/videos/coolblue.mp4",
    "1-SITE/assets/video/studio/ilari-hoevenaars.mp4",
    "1-SITE/assets/studio/blog/videos/in-de-studio-bij-machteld-van-der-gaag.mp4"
]

OUTPUT_FILE = "4-KELDER/testimonial_transcripts.json"

def transcribe_video(video_path):
    print(f"🎬 Processing: {video_path}")
    
    if not os.path.exists(video_path):
        print(f"⚠️ Skipping: {video_path} (not found)")
        return None

    audio_path = video_path.replace(".mp4", ".mp3")
    
    # 1. Extract audio using ffmpeg
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", video_path, 
            "-vn", "-acodec", "libmp3lame", "-q:a", "2", 
            audio_path
        ], check=True, capture_output=True)
    except Exception as e:
        print(f"❌ FFmpeg error: {e}")
        return None

    # 2. Send to OpenAI Whisper
    try:
        # We use curl to avoid dependency issues with 'openai' library in this environment
        curl_cmd = [
            "curl", "https://api.openai.com/v1/audio/transcriptions",
            "-H", f"Authorization: Bearer {OPENAI_API_KEY}",
            "-H", "Content-Type: multipart/form-data",
            "-F", f"file=@{audio_path}",
            "-F", "model=whisper-1",
            "-F", "response_format=verbose_json",
            "-F", "timestamp_granularities[]=segment"
        ]
        
        result = subprocess.run(curl_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Curl error: {result.stderr}")
            return None
            
        response_data = json.loads(result.stdout)
        
        # 3. Format segments
        segments = []
        for segment in response_data.get("segments", []):
            segments.append({
                "start": round(segment["start"], 2),
                "end": round(segment["end"], 2),
                "text": segment["text"].strip()
            })
            
        # Clean up audio file
        os.remove(audio_path)
        
        return segments
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        if os.path.exists(audio_path):
            os.remove(audio_path)
        return None

def main():
    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY not found in environment.")
        return

    all_transcripts = {}
    
    # Load existing if any
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r') as f:
            all_transcripts = json.load(f)

    for video in VIDEOS:
        slug = os.path.basename(video).replace(".mp4", "")
        if slug in all_transcripts:
            print(f"⏭️ Already transcribed: {slug}")
            continue
            
        transcript = transcribe_video(video)
        if transcript:
            all_transcripts[slug] = transcript
            # Save after each success
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(all_transcripts, f, indent=2)
            print(f"✅ Success: {slug}")
            time.sleep(1) # Rate limit safety

if __name__ == "__main__":
    main()
