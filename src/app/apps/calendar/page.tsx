'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminders, setReminders] = useState<{ id: string, msg: string, time: string }[]>([]);
  
  const [newMsg, setNewMsg] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('abw_calendar_reminders');
    if (saved) setReminders(JSON.parse(saved));
  }, []);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg || !newTime) return;
    const payload = { id: Math.random().toString(36).substr(2,9), msg: newMsg, time: newTime };
    const queue = [...reminders, payload].sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    setReminders(queue);
    localStorage.setItem('abw_calendar_reminders', JSON.stringify(queue));
    setNewMsg(''); setNewTime('');
  };

  const removeReminder = (id: string) => {
    const queue = reminders.filter(r => r.id !== id);
    setReminders(queue);
    localStorage.setItem('abw_calendar_reminders', JSON.stringify(queue));
  };

  // Calendar Math
  const currYear = currentDate.getFullYear();
  const currMonth = currentDate.getMonth();
  const firstDay = new Date(currYear, currMonth, 1).getDay();
  const daysInMonth = new Date(currYear, currMonth + 1, 0).getDate();
  
  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const nextMonth = () => setCurrentDate(new Date(currYear, currMonth + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currYear, currMonth - 1, 1));

  return (
    <div className="min-vh-100 py-5 pt-lg-5 mt-5">
      <div className="container mt-4">

        <motion.div 
          className="d-flex align-items-center gap-4 mb-5 p-4 rounded-4 glass-card shadow-lg"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(5, 5, 20, 0.9)', border: '1px solid rgba(224, 64, 251, 0.4)' }}
        >
          <div className="bg-primary p-3 rounded-circle shadow-lg" style={{ background: 'linear-gradient(135deg, #ab47bc, #e040fb)' }}>
             <CalendarIcon size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-white fw-bold mb-1">Timeline Engine <span className="fs-5 text-info fw-normal opacity-75 ms-2">Temporal Grid</span></h2>
            <p className="text-white-50 mb-0 fw-medium small">Execute database-backed temporal loops, chronological mapping, and automated reminders.</p>
          </div>
        </motion.div>

        <div className="row g-4">
          
          {/* Calendar Visor */}
          <motion.div className="col-lg-7" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
             <div className="glass-card p-4 p-md-5 h-100 rounded-4" style={{ background: 'rgba(5, 5, 15, 0.8)', border: '1px solid border-secondary border-opacity-50' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-25">
                   <h3 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                     {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-primary">{currYear}</span>
                   </h3>
                   <div className="d-flex gap-2">
                     <button onClick={prevMonth} className="btn btn-outline-info rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}><ChevronLeft size={20}/></button>
                     <button onClick={nextMonth} className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center text-dark shadow-sm" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0dcaf0, #0d6efd)', border: 'none' }}><ChevronRight size={20}/></button>
                   </div>
                </div>

                <div className="row g-2 mb-3 text-center">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                     <div key={d} className="col text-info fw-bold small text-uppercase opacity-75">{d}</div>
                   ))}
                </div>

                <div className="row g-2 text-center">
                   {daysArray.map((day, idx) => {
                     const isToday = day === new Date().getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear();
                     return (
                       <div key={idx} className="col" style={{ width: '14.28%', flex: '0 0 14.28%' }}>
                          {day ? (
                            <div 
                              className={`p-2 py-3 rounded-3 fw-bold transition-all ${isToday ? 'bg-primary text-dark shadow-lg' : 'text-white bg-dark border border-secondary border-opacity-25 hover-bg-light'}`}
                              style={isToday ? { background: 'linear-gradient(135deg, #ab47bc, #e040fb)' } : { cursor: 'pointer' }}
                            >
                              {day}
                            </div>
                          ) : <div className="p-2 py-3 opacity-25">-</div>}
                       </div>
                     );
                   })}
                </div>
             </div>
          </motion.div>

          {/* Reality Reminders Engine */}
          <motion.div className="col-lg-5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
             <div className="glass-card p-4 p-md-5 h-100 rounded-4 d-flex flex-column" style={{ background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(0,242,254,0.3)' }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <Clock className="text-info" size={24}/>
                  <h4 className="text-white fw-bold m-0">Temporal Reminders</h4>
                </div>
                
                <form onSubmit={handleAddReminder} className="mb-5 bg-dark p-4 rounded-4 border border-info border-opacity-25 shadow-sm">
                   <h6 className="text-white-50 fw-bold mb-3 d-flex align-items-center gap-2"><Plus size={16}/> Inject New Sequence</h6>
                   <input type="text" className="form-control bg-transparent text-white border-secondary mb-3 shadow-none" placeholder="Task Payload String" value={newMsg} onChange={e=>setNewMsg(e.target.value)} required />
                   <input type="datetime-local" className="form-control bg-transparent text-white border-secondary mb-3 shadow-none" style={{ colorScheme: 'dark' }} value={newTime} onChange={e=>setNewTime(e.target.value)} required />
                   <button type="submit" className="btn btn-info w-100 fw-bold text-dark py-2 shadow-sm d-flex justify-content-center align-items-center gap-2">Execute Sync <Clock size={16}/></button>
                </form>

                <h6 className="text-white fw-bold mb-3 d-flex justify-content-between align-items-center">Active Transmissions <span className="badge bg-primary text-dark rounded-pill">{reminders.length}</span></h6>
                <div className="overflow-y-auto pe-2 flex-grow-1" style={{ maxHeight: '300px' }}>
                   <AnimatePresence>
                     {reminders.length === 0 ? <p className="text-white-50 text-center py-4">No impending temporal operations.</p> : reminders.map(r => (
                       <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-3 bg-dark border border-secondary rounded-4 mb-2 position-relative shadow-sm user-select-none">
                          <button onClick={() => removeReminder(r.id)} className="btn btn-sm btn-outline-success position-absolute top-0 end-0 m-2 rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}><CheckCircle2 size={16} /></button>
                          <h6 className="text-white fw-bold m-0 pe-4">{r.msg}</h6>
                          <small className="text-info fw-medium mt-1 d-block">{new Date(r.time).toLocaleString()}</small>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
