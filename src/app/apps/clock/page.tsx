'use client';

import React, { useState, useEffect } from 'react';

export default function ClockApp() {
  const [activeTab, setActiveTab] = useState('world');

  // World Clock
  const [time, setTime] = useState(new Date());
  
  // Stopwatch
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState('60');

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (swRunning) {
      interval = setInterval(() => setSwTime(prev => prev + 10), 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const formatStopwatch = (ms: number) => {
    const m = Math.floor(ms / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const msStr = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${m}:${s}.${msStr}`;
  };

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const startTimer = () => {
    setTimerSeconds(parseInt(timerInput) || 60);
    setTimerRunning(true);
  };

  return (
    <div className="min-vh-100 pt-5 mt-5">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3" style={{ textShadow: '0 0 15px rgba(156, 39, 176, 0.6)' }}>
             <i className="bi bi-clock-fill text-info me-3" style={{ color: '#9c27b0' }}></i>Chronos Matrix
          </h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: 600 }}>
             Precision temporal computing. High-fidelity sub-millisecond Stopwatch, World Clock, and countdown parameters.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="glass-card p-0 rounded-4 overflow-hidden shadow-lg" style={{ background: 'rgba(10, 10, 20, 0.8)', border: '1px solid rgba(156, 39, 176, 0.3)' }}>
               
               <div className="d-flex bg-dark border-bottom border-secondary border-opacity-50">
                 <button className={`btn w-100 py-3 rounded-0 fw-bold ${activeTab === 'world' ? 'text-white' : 'text-white-50 border-0'}`} style={{ background: activeTab === 'world' ? '#9c27b0' : 'transparent' }} onClick={() => setActiveTab('world')}>World Clock</button>
                 <button className={`btn w-100 py-3 rounded-0 fw-bold ${activeTab === 'stopwatch' ? 'text-white' : 'text-white-50 border-0'}`} style={{ background: activeTab === 'stopwatch' ? '#9c27b0' : 'transparent' }} onClick={() => setActiveTab('stopwatch')}>Stopwatch</button>
                 <button className={`btn w-100 py-3 rounded-0 fw-bold ${activeTab === 'timer' ? 'text-white' : 'text-white-50 border-0'}`} style={{ background: activeTab === 'timer' ? '#9c27b0' : 'transparent' }} onClick={() => setActiveTab('timer')}>Countdown</button>
               </div>

               <div className="p-5 text-center" style={{ minHeight: '350px' }}>
                 
                 {/* WORLD CLOCK */}
                 {activeTab === 'world' && (
                   <div className="d-flex flex-column justify-content-center h-100 py-4">
                     <h2 className="text-white-50 mb-2">Local System Time</h2>
                     <h1 className="fw-bold text-white" style={{ fontSize: '4.5rem', letterSpacing: '2px', textShadow: '0 0 20px rgba(156, 39, 176, 0.5)' }}>{time.toLocaleTimeString()}</h1>
                     <p className="lead text-white-50 mt-3">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                   </div>
                 )}

                 {/* STOPWATCH */}
                 {activeTab === 'stopwatch' && (
                   <div className="d-flex flex-column justify-content-center h-100 py-3">
                     <div className="display-1 fw-bold text-white mb-5 font-monospace" style={{ textShadow: '0 0 30px rgba(156, 39, 176, 0.5)' }}>{formatStopwatch(swTime)}</div>
                     <div className="d-flex gap-3 justify-content-center">
                       <button className={`btn btn-lg fw-bold px-5 ${swRunning ? 'btn-danger' : 'btn-success'}`} onClick={() => setSwRunning(!swRunning)}>
                         {swRunning ? 'Halt' : 'Initialize'}
                       </button>
                       <button className="btn btn-outline-secondary btn-lg fw-bold px-4 text-white" onClick={() => { setSwRunning(false); setSwTime(0); }}>Reset</button>
                     </div>
                   </div>
                 )}

                 {/* TIMER */}
                 {activeTab === 'timer' && (
                   <div className="d-flex flex-column justify-content-center h-100 py-3">
                      {!timerRunning && timerSeconds === 0 ? (
                        <div className="mb-4 text-start">
                          <label className="text-white-50 mb-2">Timer Duration (Seconds)</label>
                          <div className="input-group input-group-lg shadow-sm">
                            <input type="number" className="form-control bg-dark text-white border-secondary fw-bold font-monospace" value={timerInput} onChange={e => setTimerInput(e.target.value)} />
                            <button className="btn fw-bold text-white px-4 border-0" style={{ background: '#9c27b0' }} onClick={startTimer}>Execute</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                           <div className={`display-1 fw-bold font-monospace mb-4 ${timerSeconds <= 10 ? 'text-danger' : 'text-white'}`} style={{ textShadow: timerSeconds <= 10 ? '0 0 30px rgba(220, 53, 69, 0.8)' : '0 0 30px rgba(156, 39, 176, 0.5)' }}>
                             {formatTimer(timerSeconds)}
                           </div>
                           <button className="btn btn-outline-danger btn-lg px-5 fw-bold" onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}>Abort Sequence</button>
                        </div>
                      )}
                   </div>
                 )}

               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
