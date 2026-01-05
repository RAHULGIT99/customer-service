import React, { useState, useEffect } from 'react';
import './VoiceAgent.css';

const BASE_URL = "https://twilio-backend-8evv.onrender.com"; 

const AUTH_PASSWORD = "my_set_password";
const COOLDOWN_DURATION = 300; // 5 minutes in seconds

const VoiceAgent = () => {
  // --- State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, success, error
  const [statusMessage, setStatusMessage] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);

  // --- Effects ---

  // 1. Check for active cooldown on load
  useEffect(() => {
    const savedEndTime = localStorage.getItem('callCooldownEnd');
    if (savedEndTime) {
      const remaining = Math.ceil((parseInt(savedEndTime) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldownTime(remaining);
      } else {
        localStorage.removeItem('callCooldownEnd');
      }
    }
  }, []);

  // 2. Timer Countdown Logic
  useEffect(() => {
    let interval;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('callCooldownEnd');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  // --- Handlers ---

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === AUTH_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Access Denied: Incorrect Password.');
    }
  };

  const startCooldown = () => {
    const endTime = Date.now() + (COOLDOWN_DURATION * 1000);
    localStorage.setItem('callCooldownEnd', endTime.toString());
    setCooldownTime(COOLDOWN_DURATION);
  };

  const handleCall = async () => {
    // 1. Validation
    if (phoneNumber.length !== 10 || isNaN(phoneNumber)) {
      setCallStatus('error');
      setStatusMessage('Please enter a valid 10-digit number.');
      return;
    }

    const fullNumber = `${countryCode}${phoneNumber}`;
    setCallStatus('calling');
    setStatusMessage('Dialing...');

    try {
      const res = await fetch(`${BASE_URL}/outbound-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_number: fullNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Call failed");
      }

      setCallStatus('success');
      setStatusMessage('Call Initiated Successfully!');
      startCooldown(); // Start 5 min timer

    } catch (err) {
      console.error(err);
      setCallStatus('error');
      setStatusMessage('Failed to connect call. Please try again.');
    } finally {
      // Reset success status after 3 seconds so user sees the timer
      if (callStatus !== 'error') {
        setTimeout(() => {
          setCallStatus('idle');
          setStatusMessage('');
        }, 3000);
      }
    }
  };

  // --- Format Timer (MM:SS) ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- RENDER: Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="voice-container">
        <div className="voice-card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 className="voice-title">Authorized Access</h2>
          <p className="voice-subtitle">Please verify your identity to access the Voice Agent.</p>
          
          {authError && <div className="error-msg">{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input 
                type="password" 
                className="styled-input" 
                placeholder="Enter Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
            <button type="submit" className="action-btn">
              Unlock Agent
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: Agent Interface ---
  return (
    <div className="voice-container">
      <div className="voice-card">
        {callStatus === 'calling' ? (
          <div className="ripple-loader"></div>
        ) : (
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
        )}

        <h2 className="voice-title">Voice Agent</h2>
        <p className="voice-subtitle">
          Call customers immediately and resolve their queries. <br/>
          <span style={{fontSize: '0.85rem', opacity: 0.7}}>Note: 5 min cooldown applies between calls.</span>
        </p>

        {statusMessage && (
          <div className={`error-msg`} style={{
            background: callStatus === 'success' ? '#ecfdf5' : '#fef2f2',
            color: callStatus === 'success' ? '#059669' : '#ef4444'
          }}>
            {statusMessage}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Customer Phone Number</label>
          <div className="phone-input-container">
            <select 
              className="country-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
            </select>
            <input 
              type="tel" 
              className="styled-input" 
              placeholder="Enter 10-digit number"
              maxLength="10"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} // Only allow numbers
            />
          </div>
        </div>

        <button 
          onClick={handleCall} 
          className="action-btn"
          disabled={cooldownTime > 0 || callStatus === 'calling' || phoneNumber.length < 10}
        >
          {cooldownTime > 0 ? (
            `Wait ${formatTime(cooldownTime)}`
          ) : callStatus === 'calling' ? (
            'Connecting...'
          ) : (
            'Initiate Call'
          )}
        </button>

        {cooldownTime > 0 && (
          <div className="timer-badge">
             Next call available in {formatTime(cooldownTime)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAgent;