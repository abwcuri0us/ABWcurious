'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Code, Users, MessageSquare, PlusCircle, LogOut, Settings, User, Trash2, Edit3, Send, CheckCircle, FileText, Lock } from 'lucide-react';
import { getDashboardUsers, adminUpdateUser, adminDeleteUser, updateProfileIdentity, deleteOwnAccount, changeOwnPassword, getPrivateChat, sendPrivateChat, submitFormDrop, getFormDrops, deleteFormDrop } from '@/app/actions';

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Primary Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Profile Editor State
  const [userId, setUserId] = useState('');
  const [profileData, setProfileData] = useState({ name: '', email: '', age: '0', designation: '', contact: '' });
  const [passwordInput, setPasswordInput] = useState('');

  // Admin Tables
  const [networkUsers, setNetworkUsers] = useState<any[]>([]);
  const [formDrops, setFormDrops] = useState<any[]>([]);

  // Admin App Registry
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppIcon, setNewAppIcon] = useState('rocket');

  // Real-Time Chat
  const [chatMsgs, setChatMsgs] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [targetChatUserId, setTargetChatUserId] = useState<string>('');
  const [targetChatName, setTargetChatName] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // User Forms
  const [hireTitle, setHireTitle] = useState('');
  const [hireDetails, setHireDetails] = useState('');
  const [archType, setArchType] = useState('Full-Stack Web');
  const [archDetails, setArchDetails] = useState('');

  // 1. Core Boot Sequence & Server Data Fetching
  useEffect(() => {
    const authFlag = localStorage.getItem('abw_auth');
    const authRole = localStorage.getItem('abw_role');
    const authProfile = JSON.parse(localStorage.getItem('abw_user_profile') || 'null');
    
    if (authFlag !== 'true' || !authProfile) return router.push('/login');
    
    setRole(authRole || 'user');
    setProfileData(authProfile);
    setUserId(authProfile.id || 'admin_core');

    // Poll Backend SQLite periodically
    const syncDatabase = async () => {
       try {
         // Determine whose chat to fetch
         const fetchId = authRole === 'admin' ? targetChatUserId : (authProfile.id || 'admin_core');
         if (fetchId) {
            const chatData = await getPrivateChat(fetchId);
            setChatMsgs(chatData);
         } else {
            setChatMsgs([]);
         }

         if (authRole === 'admin') {
           const users = await getDashboardUsers();
           setNetworkUsers(users);
           const forms = await getFormDrops();
           setFormDrops(forms);
         }
       } catch (e) {
         console.log("Sync Intercepted");
       }
    };
    
    syncDatabase();
    // Use interval to poll DB, capture targetChatUserId changing
    const dbInterval = setInterval(syncDatabase, 3000);
    return () => clearInterval(dbInterval);
  }, [router, targetChatUserId]);

  // Keep chat scrolled automatically
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMsgs]);

  // 2. Profile & Settings Logic (To Database)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if(userId === 'admin_core') return setShowProfile(false);
    await updateProfileIdentity(userId, profileData);
    localStorage.setItem('abw_user_profile', JSON.stringify(profileData));
    alert('✅ Physical Database Parameters Updated!');
    setShowProfile(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().length > 4) {
      if(userId !== 'admin_core') await changeOwnPassword(userId, passwordInput);
      alert('🔐 Neural Password Hash Updated Successfully!');
      setPasswordInput('');
    }
    setShowSettings(false);
  };

  const handleDeleteAccount = async () => {
    if (confirm('🚨 CRITICAL WARNING: Executing Account Termination will wipe your identity node from the physical database forever. Proceed?')) {
      if(userId !== 'admin_core') await deleteOwnAccount(userId);
      localStorage.removeItem('abw_auth');
      localStorage.removeItem('abw_role');
      localStorage.removeItem('abw_user_profile');
      router.push('/login');
    }
  };

  // 3. User Form Transmissions
  const submitHireDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!hireTitle || !hireDetails) return;
    await submitFormDrop('Personnel', hireTitle, hireDetails, profileData.name);
    setHireTitle(''); setHireDetails('');
    alert('🚀 Hiring Requisition transmitted to Admin Database Hub successfully!');
  };

  const submitArchDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!archType || !archDetails) return;
    await submitFormDrop('Architecture', archType, archDetails, profileData.name);
    setArchType('Full-Stack Web'); setArchDetails('');
    alert('🏗️ Architectural Blueprint transmitted to Admin Hub successfully!');
  };

  // 4. Admin Database Operations
  const triggerAdminEditUser = async (u: any) => {
    const newName = prompt('Modify Identity Matrix (Name):', u.name);
    if (!newName) return;
    const newDesignation = prompt('Modify Vector Deployment (Designation):', u.designation || 'Unknown');
    if (confirm(`Confirm physical database mutation for ${u.name}?`)) {
       await adminUpdateUser(u.id, newName, newDesignation || u.designation);
       alert('Mutation Successful. Awaiting ping map.');
    }
  };

  const triggerAdminDeleteUser = async (id: string) => {
    if (confirm('🚨 Authorized Wipe: Purge User Data from Cloud Backend?')) {
       await adminDeleteUser(id);
    }
  };

  const triggerAdminDeleteForm = async (id: string) => {
    await deleteFormDrop(id);
  };

  const registerApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName || !newAppUrl) return;
    const existing = JSON.parse(localStorage.getItem('abw_custom_apps') || '[]');
    localStorage.setItem('abw_custom_apps', JSON.stringify([...existing, { name: newAppName, url: newAppUrl, icon: newAppIcon }]));
    alert(`Ecosystem Payload Deployed! ${newAppName} injected into Navbar Matrix.`);
    setNewAppName(''); setNewAppUrl('');
  };

  // 5. Live Server Socket Send
  const fireChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = role === 'admin' ? targetChatUserId : userId;
    if (!chatInput.trim() || !targetId) return;
    
    const payload = chatInput; 
    setChatInput(''); // Immediate UI clear
    await sendPrivateChat(profileData.name, payload, targetId);
    
    // immediate visual update
    setChatMsgs([...chatMsgs, { id: 'temp', sender: profileData.name, text: payload, time: 'Sending...', timestamp: Date.now() }]);
  };

  if (!role) return null;

  return (
    <div className="min-vh-100 py-5 pt-lg-5 mt-5 position-relative">
      <div className="container mt-4">
        
        {/* Header Ribbon */}
        <motion.div 
          className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 glass-card shadow-lg flex-wrap gap-3"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(5, 5, 20, 0.9)', border: '1px solid rgba(0, 242, 254, 0.3)' }}
        >
          <div>
            <h2 className="text-white fw-bold mb-1">
              {role === 'admin' ? `Welcome Back, ${profileData.name} (Admin) 👋` : `Welcome, ${profileData.name}! 👋`}
            </h2>
            <p className="text-info fw-medium mb-0 d-flex align-items-center gap-2">
              <span className="spinner-grow spinner-grow-sm text-success"></span> Prisma Database Sync: Locked & Executing
            </p>
          </div>
          <div className="d-flex flex-wrap gap-3 ms-auto">
            <button onClick={() => setShowSettings(true)} className="btn btn-outline-info rounded-pill d-flex align-items-center gap-2 px-3 fw-bold">
              <Settings size={18} /> Settings
            </button>
            <button onClick={() => setShowProfile(true)} className="btn btn-primary rounded-pill d-flex align-items-center gap-2 px-3 shadow-sm fw-bold border-0" style={{ background: 'linear-gradient(135deg, #0dcaf0, #0d6efd)' }}>
              <User size={18} /> Profile
            </button>
            <button onClick={() => { localStorage.removeItem('abw_auth'); router.push('/login'); }} className="btn text-white fw-bold rounded-pill d-flex align-items-center gap-2 px-4 shadow-lg border-0 hover-scale" style={{ background: 'radial-gradient(circle, #ff4e50, #f9d423)' }}>
              <LogOut size={18} /> Exit Matrix
            </button>
          </div>
        </motion.div>

        {/* --- GLOBAL MODALS --- */}
        <AnimatePresence>
          {showProfile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', zIndex: 99999 }}>
              <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="glass-card p-5 rounded-4 shadow-lg position-relative w-100" style={{ maxWidth: '500px', background: 'rgba(15, 10, 30, 0.95)', border: '1px solid rgba(0,242,254,0.4)', overflowY: 'auto', maxHeight: '90vh' }}>
                 <button onClick={() => setShowProfile(false)} className="btn btn-close btn-close-white position-absolute top-0 end-0 m-4"></button>
                 <div className="bg-primary mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-lg" style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #0dcaf0, #0d6efd)' }}>
                    <User size={40} className="text-white" />
                 </div>
                 <h3 className="text-white fw-bold text-center">User Identity Parameters</h3>
                 <p className="text-light opacity-75 text-center mb-4">Mutate your backend data strings natively.</p>
                 
                 <form onSubmit={handleSaveProfile} className="d-flex flex-column gap-3">
                    <div><label className="text-info small fw-bold mb-1">Full Identity (Name):</label><input type="text" className="form-control bg-dark border-secondary text-white shadow-none" value={profileData.name} onChange={e=>setProfileData({...profileData, name: e.target.value})} required/></div>
                    <div><label className="text-info small fw-bold mb-1">Designation Matrix:</label><input type="text" className="form-control bg-dark border-secondary text-white shadow-none" value={profileData.designation} onChange={e=>setProfileData({...profileData, designation: e.target.value})} /></div>
                    <div className="row g-3">
                       <div className="col-6"><label className="text-info small fw-bold mb-1">Contact Array:</label><input type="text" className="form-control bg-dark border-secondary text-white shadow-none" value={profileData.contact} onChange={e=>setProfileData({...profileData, contact: e.target.value})} /></div>
                       <div className="col-6"><label className="text-info small fw-bold mb-1">Chronological Age:</label><input type="text" className="form-control bg-dark border-secondary text-white shadow-none" value={profileData.age} onChange={e=>setProfileData({...profileData, age: e.target.value})} /></div>
                    </div>
                    <div><label className="text-info small fw-bold mb-1">Secure Email Binding:</label><input type="email" className="form-control bg-dark border-info text-info fw-bold shadow-none" value={profileData.email} onChange={e=>setProfileData({...profileData, email: e.target.value})} disabled={userId==='admin_core'} required/></div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2 mt-2 shadow-sm">Save Profile To Database</button>
                 </form>
              </motion.div>
            </motion.div>
          )}

          {showSettings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', zIndex: 99999 }}>
              <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="glass-card p-5 rounded-4 shadow-lg position-relative w-100" style={{ maxWidth: '400px', background: 'rgba(15, 10, 30, 0.95)', border: '1px solid rgba(224, 64, 251, 0.4)' }}>
                 <button onClick={() => setShowSettings(false)} className="btn btn-close btn-close-white position-absolute top-0 end-0 m-4"></button>
                 <div className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-lg bg-dark border border-secondary" style={{ width: 80, height: 80 }}>
                    <Settings size={40} className="text-white-50" />
                 </div>
                 <h3 className="text-white fw-bold text-center">System & Security</h3>
                 <p className="text-light opacity-75 text-center mb-4 pb-3 border-bottom border-secondary">Manage absolute user destruction natively.</p>
                 
                 <form onSubmit={handleSaveSettings} className="mb-4">
                    <label className="text-info small fw-bold mb-1">Override Encryption Key (Password):</label>
                    <input type="password" placeholder="••••••••" className="form-control bg-dark border-secondary text-white mb-3 shadow-none" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required minLength={5} />
                    <button type="submit" className="btn btn-outline-info w-100 fw-bold">Update Master Key</button>
                 </form>

                 <div className="pt-3 border-top border-danger border-opacity-25">
                    <label className="text-danger small fw-bold mb-1 d-block text-center">Danger Zone</label>
                    <button onClick={handleDeleteAccount} className="btn w-100 fw-bold text-white shadow-lg" style={{ background: 'linear-gradient(90deg, #ff4e50, #f9d423)' }} disabled={userId==='admin_core'}><Trash2 size={16} className="me-2"/> Terminate Account</button>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="row g-4 mb-5 flex-wrap">
          {/* --- ADMIN OPERATIONS --- */}
          {role === 'admin' && (
            <>
              {/* Massive Operations Matrix */}
              <motion.div className="col-12" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                <div className="glass-card p-4 p-md-5 h-100 rounded-4 overflow-hidden" style={{ background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(224, 64, 251, 0.4)' }}>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 border-bottom border-secondary pb-4 gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-3 rounded-circle" style={{ background: 'linear-gradient(135deg, #ab47bc, #e040fb)', boxShadow: '0 0 25px rgba(224,64,251,0.5)' }}><Users size={32} className="text-white" /></div>
                      <div>
                        <h3 className="text-white m-0 fw-bold">User Management Matrix</h3>
                        <p className="text-white-50 mb-0 mt-1 small">Administrate SQL Database direct from client proxy.</p>
                      </div>
                    </div>
                    <span className="badge bg-danger text-white shadow-sm px-4 py-2 fs-5 fw-bold">{networkUsers.length} Backend Nodes</span>
                  </div>
                  
                  <div className="table-responsive rounded-4 shadow-lg border border-secondary border-opacity-50">
                    <table className="table table-dark table-hover table-borderless align-middle mb-0" style={{ background: 'rgba(255,255,255,0.02)', minWidth: 600 }}>
                      <thead className="text-info border-bottom border-secondary bg-dark">
                        <tr>
                          <th className="py-3 px-4">Entity Identity</th>
                          <th className="py-3">Designation</th>
                          <th className="py-3">Vector (Email)</th>
                          <th className="py-3">Security Level</th>
                          <th className="py-3 text-end px-4">Overrides</th>
                        </tr>
                      </thead>
                      <tbody>
                        {networkUsers.map(u => (
                          <tr key={u.id} className="border-bottom border-secondary border-opacity-25" style={{ transition: 'all 0.2s' }}>
                            <td className="px-4 py-3 text-white fw-bold d-flex align-items-center gap-2"><User size={16} className="text-info opacity-75"/> {u.name}</td>
                            <td className="py-3 text-primary fw-medium">{u.designation || 'Client'}</td>
                            <td className="py-3 text-white-50 font-monospace">{u.email}</td>
                            <td className="py-3"><span className={`badge ${u.role === 'admin' ? 'bg-info text-dark' : 'bg-secondary text-light'} px-3 py-2 rounded-pill`}>{u.role}</span></td>
                            <td className="py-3 text-end px-4">
                              <button onClick={() => { setTargetChatUserId(u.id); setTargetChatName(u.name); }} className="btn btn-sm btn-primary text-white fw-bold me-2 px-3 shadow-sm d-none d-md-inline" disabled={u.role === 'admin'}><MessageSquare size={14} className="me-1"/> Comms</button>
                              <button onClick={() => triggerAdminEditUser(u)} className="btn btn-sm btn-info text-dark fw-bold me-2 px-3 shadow-sm"><Edit3 size={14} className="me-1 d-none d-md-inline"/> Edit</button>
                              <button onClick={() => triggerAdminDeleteUser(u.id)} className="btn btn-sm btn-danger fw-bold px-3 shadow-sm" disabled={u.role === 'admin'}><Trash2 size={14} className="me-1 d-none d-md-inline"/> Wipe</button>
                            </td>
                          </tr>
                        ))}
                        {networkUsers.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-white-50">No database nodes present except Master Admin.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>

              {/* Inbound Form Architecture Drops */}
              <motion.div className="col-lg-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                 <div className="glass-card p-4 rounded-4 h-100" style={{ background: 'rgba(5, 5, 10, 0.7)', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="bg-primary p-2 rounded-circle shadow"><FileText className="text-dark"/></div>
                      <h4 className="text-white fw-bold m-0">Incoming SQL Client Transmissions</h4>
                    </div>
                    <div className="overflow-y-auto pe-2" style={{ maxHeight: '350px' }}>
                       {formDrops.length > 0 ? formDrops.map((form) => (
                         <div key={form.id} className="bg-dark border border-secondary p-3 rounded-4 mb-3 position-relative">
                           <button onClick={() => triggerAdminDeleteForm(form.id)} className="btn btn-sm btn-close btn-close-white position-absolute top-0 end-0 m-2"></button>
                           <div className="d-flex justify-content-between mb-2">
                              <span className={`badge ${form.type === 'Architecture' ? 'bg-primary' : 'bg-warning text-dark'} fw-bold px-2 py-1`}>{form.type}</span>
                              <small className="text-white-50">{form.date}</small>
                           </div>
                           <h5 className="text-white fw-bold mt-2">{form.title}</h5>
                           <p className="text-light opacity-75 small mb-2">{form.details}</p>
                           <div className="text-info fw-bold small"><User size={12}/> Origin Node: {form.submittedBy}</div>
                         </div>
                       )) : <p className="text-white-50 text-center py-5">Zero active transmissions flowing from Prisma.</p>}
                    </div>
                 </div>
              </motion.div>

              {/* App Registry Extractor */}
              <motion.div className="col-lg-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <div className="glass-card p-4 h-100 rounded-4" style={{ background: 'rgba(5, 5, 10, 0.7)', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="p-2 rounded-circle bg-primary" style={{ boxShadow: '0 0 15px rgba(0,242,254,0.5)' }}><PlusCircle className="text-dark" /></div>
                    <h4 className="text-white m-0 fw-bold">App Matrix Config</h4>
                  </div>
                  <form onSubmit={registerApp} className="d-flex flex-column gap-3 mt-4">
                    <div><input type="text" className="form-control bg-dark border-secondary text-white shadow-none" placeholder="Target App String" value={newAppName} onChange={e => setNewAppName(e.target.value)} required /></div>
                    <div><input type="text" className="form-control bg-dark border-secondary text-white shadow-none" placeholder="Absolute / Relative URI" value={newAppUrl} onChange={e => setNewAppUrl(e.target.value)} required /></div>
                    <div>
                      <select className="form-select bg-dark border-secondary text-white shadow-none" value={newAppIcon} onChange={e => setNewAppIcon(e.target.value)}>
                        <option value="rocket">Rocket Launcher</option>
                        <option value="chart-line">Algorithmic Chart</option>
                        <option value="globe">Network Globe</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-info text-dark fw-bold mt-2 py-3 shadow-lg w-100 fs-5">Inject Local Navbar</button>
                  </form>
                </div>
              </motion.div>
            </>
          )}

          {/* --- CLIENT UI (USER) --- */}
          {role === 'user' && (
            <>
              {/* Personnel Deploy */}
              <motion.div className="col-lg-5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="glass-card p-4 h-100 rounded-4 d-flex flex-column" style={{ background: 'rgba(5, 5, 10, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-primary p-2 rounded-circle shadow"><Briefcase className="text-dark" /></div>
                    <h4 className="text-white m-0 fw-bold">Deploy Personnel</h4>
                  </div>
                  <form onSubmit={submitHireDrop} className="d-flex flex-column gap-3 flex-grow-1">
                    <input type="text" className="form-control bg-dark border-secondary text-white shadow-none" placeholder="Job Title / Designation" value={hireTitle} onChange={e=>setHireTitle(e.target.value)} required />
                    <select className="form-select bg-dark border-secondary text-white shadow-none"><option>Contract: Full-Time</option><option>Contract: Part-Time Array</option></select>
                    <textarea className="form-control bg-dark border-secondary text-white shadow-none flex-grow-1" placeholder="Deep-stack engineering requirements..." value={hireDetails} onChange={e=>setHireDetails(e.target.value)} required style={{ minHeight: '120px' }}></textarea>
                    <button type="submit" className="btn btn-primary fw-bold py-3 mt-2 shadow-sm d-flex justify-content-center align-items-center gap-2">Execute Request <Send size={16}/></button>
                  </form>
                </div>
              </motion.div>

              {/* Architecture Blueprint Data Drop */}
              <motion.div className="col-lg-7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="glass-card p-4 h-100 rounded-4" style={{ background: 'rgba(5, 5, 10, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="p-2 rounded-circle shadow" style={{ background: 'linear-gradient(135deg, #0dcaf0, #0d6efd)' }}><Code className="text-white" /></div>
                    <h4 className="text-white m-0 fw-bold">Architecture Database Requisition</h4>
                  </div>
                  <form onSubmit={submitArchDrop} className="d-flex flex-column gap-3 h-100" style={{ minHeight: '250px' }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <select className="form-select bg-dark border-secondary text-white shadow-none" value={archType} onChange={e=>setArchType(e.target.value)}>
                          <option>Full-Stack Web (MERN)</option><option>Mobile Hybrid (Flutter)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <select className="form-select bg-dark border-secondary text-white shadow-none"><option>Budgets: ₹50k - ₹1.5L</option></select>
                      </div>
                    </div>
                    <textarea className="form-control bg-dark border-secondary text-white shadow-none mt-2 flex-grow-1" placeholder="Massive payload strings regarding feature architecture..." value={archDetails} onChange={e=>setArchDetails(e.target.value)} required></textarea>
                    <button type="submit" className="btn btn-info text-dark fw-bold py-3 mt-2 shadow-lg fs-5 d-flex justify-content-center align-items-center gap-2">Transmit Node Blueprint <Send size={20}/></button>
                  </form>
                </div>
              </motion.div>
            </>
          )}

          {/* --- COMMON: Persistent Chat Server Matrix --- */}
          <motion.div className="col-12 mt-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-0 rounded-4 d-flex flex-column shadow-lg" style={{ background: 'rgba(5, 5, 15, 0.85)', border: '1px solid rgba(13, 110, 253, 0.5)', height: '480px' }}>
              <div className="bg-dark p-3 border-bottom border-primary border-opacity-50 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary p-2 rounded-circle shadow shadow-info" style={{ animation: 'pulse 2s infinite' }}><MessageSquare className="text-white" size={20}/></div>
                  <div>
                    <h5 className="text-white m-0 fw-bold">
                       {role === 'admin' ? (targetChatName ? `Secure Line: ${targetChatName}` : '1-on-1 Comms Socket') : 'Secure Support Line'}
                    </h5>
                    <p className="text-info small m-0 fw-medium">Direct database polling simulating private WebSocket mechanics.</p>
                  </div>
                </div>
                <div className="spinner-grow spinner-grow-sm text-info"></div>
              </div>
              
              <div className="p-4 d-flex flex-column gap-3" ref={chatScrollRef} style={{ background: 'rgba(0,0,0,0.3)', flex: '1 1 auto', overflowY: 'auto' }}>
                 {(role === 'admin' && !targetChatUserId) ? (
                   <div className="text-center py-5">
                      <Lock size={40} className="text-white-50 mb-3" />
                      <p className="text-white-50">Select a Client Node [Comms] inside the Network Matrix to initiate private transmissions.</p>
                   </div>
                 ) : (
                   chatMsgs.length === 0 ? <p className="text-white-50 text-center py-5">Secure Line Established. Waiting for inputs.</p> : 
                     chatMsgs.map((msg) => {
                      const isMe = msg.sender === profileData.name;
                      return (
                        <div key={msg.id} className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                          <small className={`${isMe ? 'text-primary' : 'text-info'} mb-1 px-1 fw-bold`}>{msg.sender} <span className="opacity-50 text-white-50 ms-2" style={{fontSize:'0.7rem'}}>{msg.time}</span></small>
                          <div className="px-4 py-2 rounded-4 text-white shadow-sm" style={{ 
                            background: isMe ? 'linear-gradient(135deg, #0dcaf0, #0d6efd)' : 'rgba(255,255,255,0.1)',
                            borderBottomRightRadius: isMe ? '0' : '1rem', borderTopLeftRadius: isMe ? '1rem' : '0',
                            border: isMe ? 'none' : '1px solid rgba(255,255,255,0.05)',
                            maxWidth: '75%', wordBreak: 'break-word'
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      )
                   })
                 )}
              </div>

              <div className="p-3 bg-dark border-top border-primary border-opacity-25 mt-auto">
                <form onSubmit={fireChat} className="input-group input-group-lg">
                  <input type="text" className="form-control bg-dark text-white border-info border-opacity-50 shadow-none px-4 rounded-start-pill" placeholder="Broadcast encrypted transmission..." value={chatInput} onChange={e => setChatInput(e.target.value)} required disabled={role === 'admin' && !targetChatUserId} />
                  <button type="submit" className="btn btn-primary text-white px-md-5 px-3 fw-bold rounded-end-pill d-flex align-items-center gap-2 shadow-sm border-info border-opacity-50" disabled={role === 'admin' && !targetChatUserId}>
                     Initialize <Send size={18} className="d-none d-md-block"/>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
