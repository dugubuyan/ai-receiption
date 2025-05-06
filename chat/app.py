# -*- coding: utf-8 -*-
import gradio as gr
import whisper  # Corrected import for Whisper
import os
from tempfile import NamedTemporaryFile
import re
import ollama
from openai import OpenAI
from kokoro import KPipeline
import soundfile as sf
from config import MODEL_NAME, SYSTEM_PROMPT, WHISPER_MODEL, MODEL_TYPE, DEEPSEEK_API_KEY

def speech_to_text(audio_path):
    model = whisper.load_model(WHISPER_MODEL)
    transcription = model.transcribe(audio_path, fp16=False)["text"]
    return transcription

def generate_response(text):
    messages = [
        {
            'role': 'system',
            'content': SYSTEM_PROMPT
        },
        {
            'role': 'user', 
            'content': text
        }
    ]
    try:
        if MODEL_TYPE == 'ollama':
            response = ollama.chat(model=MODEL_NAME, messages=messages)
            return response['message']['content']
        elif MODEL_TYPE == 'deepseek':
            if not DEEPSEEK_API_KEY:
                raise ValueError('DeepSeek API密钥未配置')
            client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages
            )
            return response.choices[0].message.content
        else:
            raise ValueError(f'不支持的模型类型：{MODEL_TYPE}')
    except Exception as e:
        print(f'Error calling {MODEL_TYPE} API: {str(e)}')
        return '抱歉，我现在无法回应，请稍后再试。'

# def text_to_speech(text):
#     tts = gTTS(text)
#     temp_file = NamedTemporaryFile(delete=False, suffix='.mp3')
#     tts.write_to_fp(temp_file)
#     temp_file.close()
#     return temp_file.name

def text_to_speech(text):
    pipeline = KPipeline(lang_code='z')  # 'a' 表示美式英语
    generator = pipeline(text, voice='zf_xiaobei')
    temp_file = NamedTemporaryFile(delete=False, suffix='.wav')
    for i, (graphemes, phonemes, audio) in enumerate(generator):
        print(f"Segment {i}: {graphemes}")
        sf.write(temp_file, audio, 24000)  # 采样率 24kHz
    temp_file.close()
    return temp_file.name

def chatbot_pipeline(audio_path):
    try:
        # Step 1: Convert speech to text
        text_input = speech_to_text(audio_path)
        print("语音转文本结果:", text_input)

        # Step 2: Get response from LLaMA model
        response = generate_response(text_input)
        response_text = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL).strip()
        # Step 3: Convert response text to speech
        response_audio_path = text_to_speech(response_text)

        return response_text, response_audio_path

    except Exception as e:
        return str(e), None

# # Create Gradio Interface
# iface = gr.Interface(
#     fn=chatbot_pipeline,
#     inputs=gr.Audio(type="filepath", label="Speak"),  # Removed 'source' argument
#     outputs=[
#         gr.Textbox(label="Response Text"),
#         gr.Audio(label="Response Audio")
#     ],
#     title="Real-Time Voice-to-Voice Chatbot"
# )

# iface.launch()

