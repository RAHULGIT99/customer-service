import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import { formatNumberedText } from '../utils/formatHelper';

// Updated Avatars to Purple Theme
const AVATAR_USER = 'https://ui-avatars.com/api/?name=User&background=f5f3ff&color=7c3aed&size=40&rounded=true&bold=true';
const AVATAR_BOT = 'https://ui-avatars.com/api/?name=AI&background=7c3aed&color=fff&size=40&rounded=true&bold=true';

const BASE_URL = "https://iomp-backbro.onrender.com";

const generateSarvamTTS = async (text) => {
  try {
    const ttsRes = await fetch(
      `${BASE_URL}/tts?text=${encodeURIComponent(text)}&language_code=en-IN&speaker=anushka`
    );
    if (!ttsRes.ok || ttsRes.headers.get("content-type") !== "audio/mpeg") {
      console.error("TTS failed", await ttsRes.text());
      return null;
    }
    const blob = await ttsRes.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("Error in generateSarvamTTS:", err);
    return null;
  }
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef(null);

  const [file, setFile] = useState(null);
  const [indexName, setIndexName] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(''); // 'idle', 'uploading', 'success', 'error'
  
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // --- File Upload ---
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setUploadStatus('uploading'); // Triggers the Orb Animation
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BASE_URL}/document-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await res.json();

      if (data.success) {
        // Artificial delay to show off the nice animation (optional, remove if speed is priority)
        setTimeout(() => {
          setIndexName(data.index_name);
          setUploadStatus('success');
          setMessages([{
            text: `Success! I've analyzed "${file.name}". \n\nAsk me anything about the document.`,
            sender: 'bot'
          }]);
        }, 1500);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
      setUploadStatus('error');
    }
  };

  // --- Chat Logic ---
  const handleSend = async (overrideText = null) => {
    const text = overrideText ?? input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const chatRes = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          index_name: indexName
        }),
      });

      const chatData = await chatRes.json();
      const botText = chatData.answer;
      const audioUrl = await generateSarvamTTS(botText);

      setMessages(prev => [...prev, { text: botText, sender: 'bot', audioUrl }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages(prev => [...prev, { text: "Something went wrong with the server.", sender: "bot" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRecord = async () => {
    if (isRecording) return;
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("file", blob, "speech.wav");

        const res = await fetch(`${BASE_URL}/stt?language_code=en-IN`, {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        setInput(data.transcript);
        setIsRecording(false);
      };

      recorder.start();
      setTimeout(() => recorder.stop(), 4000);
    } catch (err) {
      console.error("Mic error:", err);
      setIsRecording(false);
    }
  };

  // ----------------------------------------------------
  // RENDER: UPLOAD SCREEN
  // ----------------------------------------------------
  if (!indexName) {
    return (
      <div className="chatgpt-container">
        <div className="chatgpt-header">
           <span>✨ Document AI</span>
        </div>
        
        <div className="upload-container">
          
          {showDisclaimer && uploadStatus !== 'uploading' && (
            <>
              <div className="disclaimer-overlay" onClick={handleCloseDisclaimer}></div>
              <div className="disclaimer-note">
                <div className="disclaimer-content">
                  <h3>⚠️ Demo Access</h3>
                  <p>This uploading pdf is not for everyone its only for business owners but for demo it is being allowed for everyone</p>
                </div>
                <button className="disclaimer-close" onClick={handleCloseDisclaimer}>×</button>
              </div>
            </>
          )}

          {uploadStatus === 'uploading' ? (
            /* ANIMATED PROCESSING STATE */
            <div className="processing-state">
              <div className="orb"></div>
              <div className="processing-text">Reading & Indexing...</div>
              <p style={{color: '#94a3b8', marginTop: '10px'}}>This might take a few seconds</p>
            </div>
          ) : (
            /* IDLE UPLOAD STATE */
            <div className="upload-box">
              <div className="upload-icon">📄</div>
              <h2 className="upload-title">Upload your Document</h2>
              <p className="upload-desc">
                Drag & drop your PDF here or click to browse.
                <br /> We'll analyze it so you can chat with it.
              </p>

              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="file-input"
              />
              
              <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <label htmlFor="file-upload" className="btn-upload" style={{background: 'white', color: '#7c3aed', border: '1px solid #7c3aed', boxShadow:'none', textAlign:'center', display:'block'}}>
                   {file ? file.name : "Select PDF"}
                </label>

                {file && (
                  <button onClick={handleFileUpload} className="btn-upload">
                    Start Processing ➔
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: CHAT INTERFACE
  // ----------------------------------------------------
  return (
    <div className="chatgpt-container">
      <div className="chatgpt-header">
        <span>🟣 Assistant</span>
        <button 
          className="reset-btn"
          onClick={() => { setIndexName(null); setMessages([]); setFile(null); setUploadStatus('idle'); }}
        >
          + New File
        </button>
      </div>

      <div className="chatgpt-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatgpt-row ${msg.sender}`}>
            <img
              src={msg.sender === 'user' ? AVATAR_USER : AVATAR_BOT}
              alt="avatar"
              className="chatgpt-avatar"
            />
            <div className={`chatgpt-bubble ${msg.sender}`}>
              {formatNumberedText(msg.text)}
              {msg.audioUrl && (
                <audio controls src={msg.audioUrl} style={{ width: "100%", marginTop: 12, borderRadius: '8px' }} />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chatgpt-row bot">
            <img src={AVATAR_BOT} className="chatgpt-avatar" alt="ai" />
            <div className="chatgpt-bubble bot">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chatgpt-input-area">
        <div className="chatgpt-input-container">
          <input
            type="text"
            value={input}
            placeholder="Ask something about the document..."
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button
            onClick={handleRecord}
            className="chatgpt-send-btn"
            disabled={isRecording}
            style={{background: isRecording ? '#ef4444' : 'transparent', color: isRecording? 'white' : '#64748b', boxShadow: 'none'}}
          >
             {isRecording ? "🛑" : "🎤"}
          </button>
          <button
            onClick={() => handleSend()}
            className="chatgpt-send-btn"
            disabled={!input.trim() || isTyping}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;