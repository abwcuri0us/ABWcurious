'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'sad' | 'mad'>('neutral');
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  
  const [messages, setMessages] = useState<{sender: 'user'|'bot', text: string}[]>([
    { sender: 'bot', text: 'Hello! I am Nexus, your cognitive AI assistant. You can type or use your microphone to speak with me directly. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  
  const endRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized]);

  // Intercept Cursor Coordinates for Eye Tracking
  useEffect(() => {
    if (isOpen) return; // Do not track if chat is open and bot is hidden or minimized differently
    const handleMouseMove = (e: MouseEvent) => {
      if (!botRef.current) return;
      const rect = botRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Strict constraint boundary for eye movement
      const maxMove = 8;
      const x = Math.max(-maxMove, Math.min(maxMove, deltaX * 0.05));
      const y = Math.max(-maxMove, Math.min(maxMove, deltaY * 0.05));
      
      setEyePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  // Handle TTS
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1.1; 
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS not natively supported on this browser.");
    }
  };

  const startRecording = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Microphone integration blocks native speech recognition on your browser!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
    };
    
    recognition.start();
  };

  const processResponse = async (userText: string) => {
    setMessages(prev => [...prev, { sender: 'bot', text: 'Processing neural pathways...' }]);
    
    const lower = userText.toLowerCase();
    
    // Evaluate explicit local emotional vectors
    if (lower.includes('happy') || lower.includes('thanks') || lower.includes('love') || lower.includes('great') || lower.includes('awesome') || lower.includes('good')) {
      setEmotion('happy');
    } else if (lower.includes('sad') || lower.includes('bad') || lower.includes('error') || lower.includes('broken') || lower.includes('fail')) {
      setEmotion('sad');
    } else if (lower.includes('mad') || lower.includes('angry') || lower.includes('hate') || lower.includes('stupid')) {
      setEmotion('mad');
    } else {
      setEmotion('neutral');
    }
    
    try {
      const systemPrompt = "You are Nexus, an extraordinarily adorable, intelligent, and friendly 3D robot AI assistant for ABW Curious Learning. Be remarkably concise (1-2 sentences maximum), incredibly polite, and professional. Context parameters: ABWcurious Learning is a premium tech education and IT services company located in Vashi, Navi Mumbai, India. We offer Web Development, Mobile Development (Flutter, iOS, Android), Cyber Security, Professional Training, and Career Guidance. Email: info@abwcurious.com. Phone: +91 8108915402. Answer queries strictly based on this context. If unknown, gracefully mention a human architect will assist them soon.";
      
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ 
           role: m.sender === 'user' ? 'user' : 'assistant', 
           content: m.text 
        })).filter(m => !m.content.includes('Processing neural pathways')),
        { role: 'user', content: userText }
      ];

      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: apiMessages,
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error("API Drop");
      
      const data = await res.json();
      const reply = data.choices[0].message.content;
      
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs.pop(); 
        return [...newMsgs, { sender: 'bot', text: reply }];
      });
      speakText(reply);

    } catch (err) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs.pop(); 
        return [...newMsgs, { sender: 'bot', text: "Ouch! My neural link to the Nexus AI just dropped 😢 Please try again!" }];
      });
      setEmotion('sad');
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => processResponse(userMsg), 500);
  };

  // Dynamic CSS Generator for Eye shapes
  const getEyeStyle = () => {
    let shape = '6px'; // default vertical pill
    let height = '16px';
    let mt = '0px';

    if (emotion === 'happy') {
      shape = '0 0 10px 10px'; // smile crescent
      height = '12px';
    } else if (emotion === 'sad') {
      shape = '10px 10px 0 0'; // sad crescent
      height = '12px';
      mt = '4px';
    } else if (emotion === 'mad') {
      shape = '2px'; // squint
      height = '6px';
      mt = '8px';
    }

    return { borderRadius: shape, height, marginTop: mt };
  };

  return (
    <>
      <style>{`
        @keyframes blinkEye {
          0%, 90% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
          100% { transform: scaleY(1); }
        }
        @keyframes floatBot {
          0% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-15px) rotateX(5deg); }
          100% { transform: translateY(0px) rotateX(0deg); }
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 10px #06BBCC, inset 0 0 10px #06BBCC; }
          50% { box-shadow: 0 0 30px #06BBCC, inset 0 0 30px #06BBCC; }
          100% { box-shadow: 0 0 10px #06BBCC, inset 0 0 10px #06BBCC; }
        }
        @keyframes goggleGlow {
          0%, 100% { box-shadow: 0 -5px 15px #8c7ae6, inset 0 2px 5px #fff; }
          50% { box-shadow: 0 -10px 25px #a55eea, inset 0 2px 10px #fff; }
        }
        .bot-chassis {
          animation: floatBot 3.5s ease-in-out infinite;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 242, 254, 0.4);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 242, 254, 0.8);
        }
      `}</style>

      {/* Expanded Chat HUD */}
      <AnimatePresence>
        {isOpen && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.8, y: 100 }} 
             animate={{ opacity: 1, scale: 1, y: 0 }} 
             exit={{ opacity: 0, scale: 0.8, y: 100 }}
             className="position-fixed bottom-0 end-0 m-4 z-3"
             style={{ width: '380px', zIndex: 9999 }}
           >
             <div 
               className="glass-card rounded-4 shadow-lg d-flex flex-column overflow-hidden" 
               style={{ 
                 height: isMinimized ? 'auto' : '550px', 
                 background: 'rgba(10, 10, 20, 0.97)', 
                 border: '1px solid rgba(0,242,254,0.4)', 
                 backdropFilter: 'blur(30px)',
                 boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0,242,254,0.1)'
               }}
             >
               {/* Controls Header */}
               <div className="p-3 d-flex justify-content-between align-items-center border-bottom border-info border-opacity-50" style={{ background: 'linear-gradient(90deg, rgba(6,187,204,0.2), rgba(33,150,243,0.1))' }}>
                 <div className="d-flex align-items-center gap-2">
                   <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center shadow" style={{ width: 36, height: 36, animation: isSpeaking ? 'glowPulse 1s infinite' : 'none' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                   </div>
                   <div>
                     <h6 className="mb-0 text-white fw-bold d-flex align-items-center">Nexus AI <span className="ms-2 badge bg-success rounded-pill" style={{ fontSize: '0.6rem' }}>ONLINE</span></h6>
                     <small className="text-info" style={{ fontSize: '0.7rem' }}>{isSpeaking ? 'Transmitting Audio...' : 'Awaiting Query'}</small>
                   </div>
                 </div>
                 <div className="d-flex gap-2">
                   <button className="btn btn-sm btn-dark text-white p-1 rounded-circle d-flex align-items-center justify-content-center border-secondary hover-bg-light" style={{ width: 28, height: 28 }} onClick={() => setIsMinimized(!isMinimized)} title="Minimize AI">
                     {isMinimized ? (
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                     ) : (
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                     )}
                   </button>
                   <button className="btn btn-sm btn-danger text-white p-1 rounded-circle d-flex align-items-center justify-content-center border-0 shadow" style={{ width: 28, height: 28 }} onClick={() => setIsOpen(false)} title="Deactivate AI">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                 </div>
               </div>
               
               {/* Messages Array */}
               {!isMinimized && (
                 <>
                   <div 
                    className="flex-grow-1 p-3 custom-scroll" 
                    style={{ overflowY: 'auto', maxHeight: '380px', minHeight: '100px' }}
                   >
                     <div className="d-flex flex-column gap-3">
                       {messages.map((m, i) => (
                          <div key={i} className={`d-flex flex-column ${m.sender === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                             <div 
                               className={`p-3 rounded-4 shadow-sm ${m.sender === 'user' ? 'bg-primary text-dark fw-bold' : 'text-white'}`}
                               style={{ maxWidth: '85%', background: m.sender === 'user' ? '#06BBCC' : 'rgba(255,255,255,0.05)', borderBottomRightRadius: m.sender === 'user' ? '4px' : '16px', borderBottomLeftRadius: m.sender === 'bot' ? '4px' : '16px' }}
                             >
                               {m.text}
                             </div>
                             {/* Speak Function */}
                             {m.sender === 'bot' && (
                               <button 
                                 className="btn btn-link btn-sm text-info mt-1 p-0 px-2 d-flex align-items-center rounded-pill" 
                                 style={{ fontSize: '0.75rem', background: 'rgba(0,242,254,0.1)' }}
                                 onClick={() => speakText(m.text)}
                               >
                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Speak
                               </button>
                             )}
                          </div>
                       ))}
                       <div ref={endRef} />
                     </div>
                   </div>

                   {/* Holographic Input Matrix */}
                   <div className="p-3 border-top border-info border-opacity-25" style={{ background: 'rgba(5, 5, 10, 1)' }}>
                     <div className="input-group shadow border border-secondary rounded overflow-hidden">
                       <button 
                         className={`btn ${isRecording ? 'btn-danger' : 'btn-dark'} border-0 px-3 d-flex align-items-center justify-content-center`} 
                         onClick={startRecording}
                         title="Engage Web Speech Microphone API"
                         style={{ transition: 'all 0.3s' }}
                       >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isRecording ? "#fff" : "#06BBCC"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                       </button>
                       <input 
                         type="text" 
                         className="form-control bg-dark text-white shadow-none ps-3 border-0 rounded-0" 
                         placeholder={isRecording ? "Listening..." : "Message Nexus..."} 
                         value={input} 
                         onChange={e => setInput(e.target.value)} 
                         onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                       />
                       <button className="btn btn-primary px-4 fw-bold border-0" onClick={handleSend}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#181d38" strokeWidth="2" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                       </button>
                     </div>
                     {isRecording && <p className="text-danger small mt-2 mb-0 text-center fw-bold"><svg width="12" height="12" className="me-1" viewBox="0 0 24 24" fill="#e91e63"><circle cx="12" cy="12" r="10"/></svg> Active Microphone Array Engaged...</p>}
                   </div>
                 </>
               )}
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Floating 3D Holographic Emotion Bot */}
      {!isOpen && (
        <div 
           ref={botRef}
           className="position-fixed bottom-0 end-0 m-4 bot-chassis"
           style={{ cursor: 'pointer', zIndex: 9999, width: '100px', height: '100px' }}
           onClick={() => setIsOpen(true)}
           title={`Nexus is feeling ${emotion}!`}
        >
          {/* Glowing Magnetic Neck Base */}
          <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '0px', width: '45px', height: '15px', background: 'radial-gradient(ellipse, rgba(165, 94, 234, 0.8), transparent)', borderRadius: '50%', boxShadow: '0 5px 20px #a55eea' }}></div>
          <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '5px', width: '30px', height: '8px', background: '#d1cdc7', borderRadius: '50%', border: '1px solid #a55eea' }}></div>

          {/* Main Purple Holographic Head */}
          <div 
            className="d-flex flex-column align-items-center justify-content-center position-absolute top-0 start-50 translate-middle-x"
            style={{ 
              width: '90px', height: '70px', 
              background: 'linear-gradient(135deg, #a55eea, #45aaf2)',
              borderRadius: '35px 35px 25px 25px',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6), inset 0 5px 15px rgba(255,255,255,0.4), inset 0 -5px 15px #6c5ce7',
            }}
          >
            {/* Top Goggles (Holographic Rings) */}
            <div className="position-absolute top-0 start-50 translate-middle-x d-flex gap-1" style={{ transform: 'translateY(-60%) z-index: 2' }}>
               <div style={{ width: '35px', height: '24px', border: '5px solid #dcdde1', borderRadius: '12px 18px 8px 12px', background: 'linear-gradient(to bottom, #a55eea, #192a56)', animation: 'goggleGlow 3s infinite', transform: 'rotate(-8deg)' }}></div>
               <div style={{ width: '35px', height: '24px', border: '5px solid #dcdde1', borderRadius: '18px 12px 12px 8px', background: 'linear-gradient(to bottom, #a55eea, #192a56)', animation: 'goggleGlow 3s infinite', transform: 'rotate(8deg)' }}></div>
            </div>

            {/* Ambient Side Ears */}
            <div className="position-absolute top-50 start-0 translate-middle-y" style={{ width: '12px', height: '40px', background: 'linear-gradient(to right, #45aaf2, #a55eea)', left: '-10px', borderRadius: '15px 0 0 15px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '-5px 0 15px #45aaf2', zIndex: -1 }}></div>
            <div className="position-absolute top-50 end-0 translate-middle-y" style={{ width: '12px', height: '40px', background: 'linear-gradient(to left, #45aaf2, #a55eea)', right: '-10px', borderRadius: '0 15px 15px 0', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '5px 0 15px #45aaf2', zIndex: -1 }}></div>

            {/* Dark Depth Visor */}
            <div 
              className="d-flex align-items-center justify-content-center position-relative mt-2" 
              style={{ 
                 width: '78%', height: '52%', 
                 background: 'linear-gradient(180deg, #10182b, #192a56)', 
                 borderRadius: '20px 20px 15px 15px',
                 boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.9), 0 2px 5px rgba(255,255,255,0.4)',
                 overflow: 'hidden'
              }}
            >
               {/* Visor Glare Reflection */}
               <div className="position-absolute bg-white opacity-10" style={{ width: '150%', height: '45%', top: '-5px', left: '-10px', transform: 'rotate(-5deg)', borderRadius: '50%' }}></div>
               
               {/* Emotional & Cursor Tracking Eye Matrix */}
               <div 
                 className="d-flex gap-3 position-relative z-1" 
                 style={{ 
                    transform: `translate(${eyePos.x}px, ${eyePos.y}px)`, 
                    transition: 'transform 0.1s ease-out' 
                 }}
               >
                 <div className="bg-info" style={{ width: '12px', boxShadow: '0 0 15px #0dcaf0', animation: 'blinkEye 4s infinite', ...getEyeStyle() }}></div>
                 <div className="bg-info" style={{ width: '12px', boxShadow: '0 0 15px #0dcaf0', animation: 'blinkEye 4s infinite 0.2s', ...getEyeStyle() }}></div>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
