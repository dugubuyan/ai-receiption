from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import Optional
from app import chatbot_pipeline
import uvicorn
import tempfile
import os
from uvicorn.config import LOGGING_CONFIG
import logging

app = FastAPI()
logger = logging.getLogger("uvicorn")

from fastapi.responses import StreamingResponse
from io import BytesIO
import base64

class ChatResponse(BaseModel):
    response_text: str

ALLOWED_AUDIO_TYPES = [
    "audio/wav",
    "audio/mp3",
    "audio/mpeg",
    "audio/x-wav",
    "audio/webm"
]

@app.post("/chat")
async def chat(audio_file: UploadFile = File(...)):
    if audio_file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid file type. Allowed types are: {', '.join(ALLOWED_AUDIO_TYPES)}"
        )

    try:
        # 创建临时文件保存上传的音频
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file.flush()
            
            # 调用chatbot_pipeline处理请求
            response_text, response_audio_path = chatbot_pipeline(temp_file.name)
            
            # 使用uvicorn logger记录结果
            logger.info(f"语音转文本结果: {response_text}")
            logger.info(f"音频文件路径: {response_audio_path}")
            
            # 如果返回的是错误信息，抛出异常
            if response_audio_path is None:
                raise HTTPException(status_code=400, detail=response_text)
            
            # 检查音频文件是否存在
            if not os.path.exists(response_audio_path):
                logger.error(f"Audio file not found at {response_audio_path}")
                raise HTTPException(status_code=500, detail="Failed to generate audio response")

            # 从临时文件读取音频数据
            with open(response_audio_path, 'rb') as audio_file:
                audio_data = audio_file.read()
                file_size = len(audio_data)
                logger.info(f"Reading audio file: {response_audio_path}, size: {file_size} bytes")

                if file_size == 0:
                    logger.error("Audio file is empty")
                    raise HTTPException(status_code=500, detail="Generated audio file is empty")

                # 返回音频数据
                try:
                    # 使用BytesIO包装音频数据
                    audio_stream = BytesIO(audio_data)
                    return StreamingResponse(
                        content=audio_stream,
                        media_type="audio/mpeg",
                        headers={
                            "Content-Disposition": "attachment;filename=response.mp3",
                            "Content-Length": str(file_size),
                            "X-Response-Text": base64.b64encode(response_text.encode('utf-8')).decode('ascii')
                        }
                    )
                except Exception as e:
                    logger.error(f"Error creating StreamingResponse: {str(e)}")
                    raise HTTPException(status_code=500, detail="Failed to stream audio response")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)