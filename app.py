from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper, librosa, noisereduce as nr, scipy.io.wavfile as wavfile, os

app = Flask(__name__)
CORS(app)
model = whisper.load_model("base")

@app.route('/process', methods=['POST'])
def process_video():
    file = request.files['video']
    file.save("input.mp4")
    os.system("ffmpeg -i input.mp4 -q:a 0 -map a audio.wav -y")
    
    data, rate = librosa.load("audio.wav")
    reduced_noise = nr.reduce_noise(y=data, sr=rate)
    wavfile.write("clean.wav", rate, reduced_noise)
    
    result = model.transcribe("clean.wav")
    
    # Cleanup
    for f in ["input.mp4", "audio.wav", "clean.wav"]:
        if os.path.exists(f): os.remove(f)
        
    return jsonify({"subtitles": result["text"]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
