import { useState } from 'react';
import { Button, Card, Input, Space, message } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';

function TextPage() {
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClear = () => {
    setInputText('');
    setResponseText('');
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      message.warning('请输入问题');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/chatText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'question': inputText.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponseText(data.response_text || '已完成');
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
          <Input.TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入您的问题"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Card>

        <Card className="response-section">
          <div className="response-status">{isLoading ? '等待响应' : '已完成'}</div>
          <div className="response-text">
            {responseText || ''}
          </div>
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
            disabled={!inputText.trim()}
          >
            提交
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default TextPage;