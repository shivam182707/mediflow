import React, { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Bot, User, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatArea = ({ messages, isTyping, onSendMessage, onFileUpload }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <main className="chat-container glass-panel">
      {/* Header */}
      <header className="chat-header">
        <div className="header-info">
          <h3>Medical Assistant</h3>
          <p className="status-dot">Online</p>
        </div>
      </header>

      {/* Messages List */}
      <div className="messages-list">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Bot size={48} className="empty-icon" />
            </div>
            <h2>How can I help you today?</h2>
            <p>Upload a medical report or describe your symptoms.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`message-bubble ${msg.role}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ node, ...props }) => <div className="table-wrapper"><table {...props} /></div>
                }}
              >
                {msg.content}
              </ReactMarkdown>
              {msg.timestamp && (
                <span className="timestamp">{msg.timestamp}</span>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message-row assistant">
            <div className="message-avatar"><Bot size={20} /></div>
            <div className="message-bubble typing-indicator">
              <span className="typing-text">Dr. Emily Hartman is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="input-area" onSubmit={handleSubmit}>
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current.click()}
        >
          <Paperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={toggleListening}
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          title="Click to speak"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          placeholder={isListening ? "Listening..." : "Type your health concern..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input"
        />

        <button
          type="submit"
          className="send-btn"
          disabled={!input.trim()}
        >
          <Send size={20} />
        </button>
      </form>

      <style jsx>{`
        .chat-container {
          flex: 1;
          height: 96vh;
          margin: 2vh 2vh 2vh 0;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .chat-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.4);
        }

        .header-info h3 {
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.2rem;
        }

        .status-dot {
          font-size: 0.8rem;
          color: var(--text-muted);
          position: relative;
          padding-left: 12px;
        }

        .status-dot::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          text-align: center;
          margin-top: -3rem;
        }

        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(13, 148, 136, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: var(--primary);
        }

        .message-row {
          display: flex;
          gap: 12px;
          max-width: 80%;
          animation: fadeIn 0.3s ease-out;
        }

        .message-row.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .message-row.user .message-avatar {
          background: var(--primary);
          color: white;
          border: none;
        }

        .message-bubble {
          padding: 1rem 1.2rem;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.6;
          box-shadow: var(--shadow-sm);
        }

        .message-bubble.assistant {
          background: white;
          border-top-left-radius: 4px;
          color: var(--text-main);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .message-bubble.user {
          background: var(--primary);
          color: white;
          border-top-right-radius: 4px;
        }

        .timestamp {
          display: block;
          font-size: 0.7rem;
          margin-top: 0.5rem;
          opacity: 0.7;
          text-align: right;
        }

        /* Markdown Styling within bubbles */
        .message-bubble :global(p) { margin-bottom: 0.5rem; }
        .message-bubble :global(p:last-child) { margin-bottom: 0; }
        .message-bubble :global(strong) { font-weight: 600; }
        .message-bubble :global(h1), .message-bubble :global(h2), .message-bubble :global(h3) {
          margin: 1rem 0 0.5rem;
          font-weight: 700;
          line-height: 1.3;
        }
        .message-bubble :global(ul), .message-bubble :global(ol) {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .message-bubble :global(li) { margin-bottom: 0.2rem; }
        .message-bubble :global(blockquote) {
          border-left: 3px solid rgba(0,0,0,0.1);
          padding-left: 1rem;
          font-style: italic;
        }
        
        /* Table Styling */
        .table-wrapper {
          overflow-x: auto;
          margin: 1rem 0;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .message-bubble :global(table) {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .message-bubble :global(th), .message-bubble :global(td) {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .message-bubble :global(th) {
          background: rgba(0,0,0,0.03);
          font-weight: 600;
        }

        /* User Bubble Overrides for Markdown */
        .message-bubble.user :global(h1), .message-bubble.user :global(h2) { color: white; }
        .message-bubble.user :global(a) { color: #ccfbf1; text-decoration: underline; }

        .input-area {
          padding: 1.5rem;
          background: white;
          display: flex;
          align-items: center;
          gap: 12px;
          border-top: 1px solid var(--glass-border);
        }

        .chat-input {
          flex: 1;
          padding: 14px 20px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-family: inherit;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }

        .chat-input:focus {
          background: white;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .attach-btn, .send-btn {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .attach-btn {
          background: transparent;
          color: var(--text-muted);
        }
        
        .attach-btn:hover {
          background: #f1f5f9;
          color: var(--text-main);
        }

        .mic-btn {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: var(--text-muted);
        }

        .mic-btn:hover {
          background: #f1f5f9;
          color: var(--primary);
        }

        .mic-btn.listening {
          background: #fee2e2;
          color: #ef4444;
          animation: pulse-red 1.5s infinite;
        }

        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .send-btn {
          background: var(--primary);
          color: white;
        }

        .send-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .send-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }

        .typing-text {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-style: italic;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </main>
  );
};

export default ChatArea;
