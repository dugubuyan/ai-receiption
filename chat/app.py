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
from config import DEEPSEEK_API_URL, DEEPSEEK_MODEL_NAME, OLLAMA_MODEL_NAME, SYSTEM_PROMPT, WHISPER_MODEL, MODEL_TYPE, DEEPSEEK_API_KEY

def speech_to_text(audio_path):
    model = whisper.load_model(WHISPER_MODEL)
    transcription = model.transcribe(audio_path, fp16=False)["text"]
    return transcription
tools=[
    {
        "type": "function",
        "function": {
            "name": "get_menu",
            "description": "获取菜单详情，返回一个图片的url或者markdown文档",
            "parameters": {
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "order",
            "description": "下单，用户需要提供桌号，下单的所有菜品",
            "parameters": {
                "type": "object",
                "properties": {
                    "table_no": {
                        "type": "number",
                        "description": "The number of the table, e.g. 8",
                    },
                    "deals":{
                        "type": "array",
                        "description": "下单的所有菜品，字符串数组"
                    }
                },
                "required": ["table_no","deals"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "pay_bill",
            "description": "买单，用户需要输入桌号",
            "parameters": {
                "type": "object",
                "properties": {
                    "table_no": {
                        "type": "number",
                        "description": "The number of the table, e.g. 8",
                    }
                },
                "required": ["table_no"]
            },
        }
    }
]

def get_menu():
    return "menu.jpg"

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
            response = ollama.chat(model=OLLAMA_MODEL_NAME, messages=messages)
            return response['message']['content']
        elif MODEL_TYPE == 'deepseek':
            if not DEEPSEEK_API_KEY:
                raise ValueError('DeepSeek API密钥未配置')
            client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_API_URL)
            response = client.chat.completions.create(
                model=DEEPSEEK_MODEL_NAME,
                messages=messages,
                tools=tools
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
    pipeline = KPipeline(lang_code='z')  # 中文
    generator = pipeline(text, voice='zf_xiaoxiao')
    temp_file = NamedTemporaryFile(delete=False, suffix='.wav')
    for i, (graphemes, phonemes, audio) in enumerate(generator):
        print(f"Segment {i}: {graphemes}")
        sf.write(temp_file, audio, 24000)  # 采样率 24kHz
    temp_file.close()
    return temp_file.name

def chatbot_pipeline(audio_path):
    try:
        from datetime import datetime

        # Step 1: Convert speech to text
        step1_start = datetime.now()
        text_input = speech_to_text(audio_path)
        step1_end = datetime.now()
        step1_duration = (step1_end - step1_start).total_seconds()
        print(f"语音转文本结果 (耗时: {step1_duration:.2f}秒):", text_input)

        # Step 2: Get response from LLaMA model
        step2_start = datetime.now()
        response = generate_response(text_input)
        response_text = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL).strip()
        step2_end = datetime.now()
        step2_duration = (step2_end - step2_start).total_seconds()
        print(f"LLaMA模型回复 (耗时: {step2_duration:.2f}秒):", response_text)

        # Step 3: Convert response text to speech
        step3_start = datetime.now()
        response_audio_path = text_to_speech(response_text)
        step3_end = datetime.now()
        step3_duration = (step3_end - step3_start).total_seconds()
        print(f"文本转语音完成 (耗时: {step3_duration:.2f}秒)")

        total_duration = (step3_end - step1_start).total_seconds()
        print(f"总耗时: {total_duration:.2f}秒")

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

