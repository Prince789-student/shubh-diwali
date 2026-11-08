from faster_whisper import WhisperModel

print("Loading Whisper model...")
model = WhisperModel("tiny", device="cpu", compute_type="int8")

print("\n=== LAKSHMI AARTI TRANSCRIBED ===")
segments, info = model.transcribe("assets/audio/lakshmi_aarti.mp3", language="hi")
for s in segments:
    print(f"{s.start:.1f}s -> {s.end:.1f}s: {s.text}")

print("\n=== GANESH AARTI TRANSCRIBED ===")
segments, info = model.transcribe("assets/audio/ganesh_aarti.mp3", language="hi")
for s in segments:
    print(f"{s.start:.1f}s -> {s.end:.1f}s: {s.text}")
