import { useState, useRef, useEffect } from 'react';
import { Button, Card, Space, message } from 'antd';
import { AudioOutlined, CloseOutlined, SendOutlined, SoundOutlined } from '@ant-design/icons';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseAudioUrl, setResponseAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('录音数据片段已收集:', e.data.size, '字节');
          console.log('当前已收集的片段数:', chunksRef.current.length);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        console.log('录音完成，生成的Blob大小:', blob.size, '字节, 类型:', blob.type);
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      message.error('无法访问麦克风');
      console.error('录音错误:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleClear = () => {
    setResponseText('');
    setAudioBlob(null);
    setResponseAudioUrl(null);
    chunksRef.current = [];
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      message.warning('请先录制音频');
      return;
    }

    console.log('提交的音频Blob大小:', audioBlob.size, '字节, 类型:', audioBlob.type);
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('audio_file', audioBlob);

      const response = await fetch('/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = response.headers.get('X-Response-Text');
      const decodedText = responseText ? decodeURIComponent(escape(atob(responseText))) : '';
      const responseAudioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(responseAudioBlob);
      setResponseText(decodedText || '已完成');
      setResponseAudioUrl(audioUrl);
    } catch (error) {
      message.error('提交失败: ' + error.message);
      console.error('提交错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <Card className="voice-input-section">
          <div className="record-status">
            <AudioOutlined style={{ fontSize: '24px', color: isRecording ? '#ff4d4f' : '#1890ff' }} />
            <div className="status-text">{isRecording ? '录音中...' : '未开始'}</div>
          </div>
          <Button 
            type={isRecording ? 'primary' : 'default'}
            icon={<AudioOutlined />}
            onClick={handleRecord}
            className="record-button"
          >
            {isRecording ? '停止录音' : '开始录音'}
          </Button>
        </Card>

        <Card className="response-section">
          <div className="response-status">{isLoading ? '等待响应' : '已完成'}</div>
          <div className="response-text">
            {responseText ? responseText : ''}
          </div>
          <Button 
            type="text" 
            icon={<SoundOutlined />}
            className="play-audio-button"
            disabled={!responseAudioUrl}
            onClick={() => {
              const audio = new Audio(responseAudioUrl);
              audio.play().catch(error => {
                message.error('音频播放失败');
                console.error('播放错误:', error);
              });
            }}
          >
            播放语音
          </Button>
        </Card>
      </div>

      <div className="control-buttons">
        <Space>
          <Button 
            icon={<CloseOutlined />} 
            onClick={handleClear}
          >
            清除
          </Button>
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!audioBlob}
          >
            提交
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default App;
