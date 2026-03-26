'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { default as NextImage } from 'next/image';
import { PenTool, Search, User, Clock, Send, Globe } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  tags: string[];
}

const INITIAL_BLOGS: Blog[] = [
  { id: '1', title: 'The Evolution of High-Tech UI & Glassmorphism', author: 'ABW Admin', content: 'We are thrilled to announce the absolute architectural reconstruction of the ABW Curious Learning frontend. Incorporating pure CSS 3D physics natively across all DOM parameters.', date: new Date().toLocaleDateString(), tags: ['Architecture', 'UI/UX'] },
  { id: '2', title: 'Why NextJS App Router Dominates 2026', author: 'Nexus Node', content: 'React Server Components drastically minimize the Javascript bundle payload shipped to the client viewport. By migrating our systems to React 18, we achieve absolute dominance in payload efficiency.', date: new Date(Date.now() - 86400000).toLocaleDateString(), tags: ['NextJS', 'Performance'] },
  { id: '3', title: 'Mistral API Neural Injections', author: 'System Operator', content: 'Integrating Large Language Models directly into the Web-Speech UI component yields unprecedented accessibility loops. Ask Nexus anything regarding ABW services!', date: new Date(Date.now() - 172800000).toLocaleDateString(), tags: ['AI', 'Mistral'] },
];

export default function CosmosBlogger() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeUser, setActiveUser] = useState('Anonymous Node');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Technology');

  useEffect(() => {
    // Authenticate & Load
    const role = localStorage.getItem('abw_role');
    if (role === 'admin') setActiveUser('ABW Admin');
    else if (role === 'user') setActiveUser('Verified Client');
    
    const db = localStorage.getItem('abw_cosmos_blogs');
    if (db) setBlogs(JSON.parse(db));
    else {
      localStorage.setItem('abw_cosmos_blogs', JSON.stringify(INITIAL_BLOGS));
      setBlogs(INITIAL_BLOGS);
    }
  }, []);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const post: Blog = {
      id: Math.random().toString(36).substring(7),
      title: newTitle,
      author: activeUser,
      content: newContent,
      date: new Date().toLocaleDateString(),
      tags: [newTag]
    };

    const updatedGrid = [post, ...blogs];
    setBlogs(updatedGrid);
    localStorage.setItem('abw_cosmos_blogs', JSON.stringify(updatedGrid));
    
    setNewTitle(''); setNewContent(''); setIsPublishing(false);
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-vh-100 py-5 pt-lg-5 mt-5">
      <div className="container mt-4">

        {/* Header Array */}
        <motion.div 
          className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 p-4 rounded-4 glass-card"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(10, 10, 20, 0.8)', border: '1px solid rgba(224, 64, 251, 0.3)' }}
        >
          <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
            <div className="p-3 rounded-circle shadow-lg" style={{ background: 'linear-gradient(135deg, #ab47bc, #e040fb)' }}>
               <Globe size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-white fw-bold mb-1">Cosmos Blogger <span className="text-info fs-5 opacity-75 fw-normal ms-2">Global Network</span></h2>
              <p className="text-white-50 mb-0 fw-medium small">Distribute technological insights instantly across the decentralized ABW matrix.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsPublishing(!isPublishing)} 
            className={`btn rounded-pill px-4 fw-bold shadow-lg d-flex align-items-center gap-2 ${isPublishing ? 'btn-danger text-dark' : 'btn-primary'}`}
            style={isPublishing ? { background: 'linear-gradient(90deg, #ff4e50, #f9d423)', border:'none' } : { background: 'linear-gradient(90deg, #ab47bc, #e040fb)', border:'none' }}
          >
            {isPublishing ? 'Abort Publish' : <><PenTool size={18} /> Transmit Article</>}
          </button>
        </motion.div>

        {/* Publishing Grid Dropdown */}
        <AnimatePresence>
          {isPublishing && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass-card overflow-hidden rounded-4 mb-5"
              style={{ background: 'rgba(5, 5, 10, 0.9)', border: '1px solid rgba(224, 64, 251, 0.5)' }}
            >
              <div className="p-4 p-md-5">
                <h4 className="text-white fw-bold mb-4 d-flex align-items-center gap-2"><div className="spinner-grow spinner-grow-sm text-info"></div> Initiating Data Transmission</h4>
                <form onSubmit={handlePublish} className="row g-4">
                  <div className="col-md-9">
                    <input type="text" className="form-control bg-dark border-secondary text-white py-3 shadow-none fs-5" placeholder="Article Title (e.g. Next-Gen Cyber Protocols)" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                  </div>
                  <div className="col-md-3">
                    <select className="form-select bg-dark border-secondary text-info fw-bold py-3 shadow-none h-100" value={newTag} onChange={e => setNewTag(e.target.value)}>
                       <option>Technology</option><option>Cyber Security</option><option>UI/UX Arrays</option><option>System Status</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <textarea className="form-control bg-dark border-secondary text-white shadow-none p-4" rows={6} placeholder="Execute string data here..." value={newContent} onChange={e => setNewContent(e.target.value)} required></textarea>
                  </div>
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-info text-dark fw-bold px-5 py-3 rounded-pill shadow-lg d-flex align-items-center gap-2 ms-auto">
                       Broadcast to Network <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Network Search Mechanics */}
        <motion.div className="mb-5 position-relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
           <Search className="position-absolute text-white-50" size={20} style={{ top: '50%', left: '20px', transform: 'translateY(-50%)' }} />
           <input 
             type="text" 
             className="form-control bg-dark border-info border-opacity-50 text-white rounded-pill shadow-none fw-medium py-3" 
             style={{ paddingLeft: '55px', boxShadow: '0 0 15px rgba(0,242,254,0.1)' }}
             placeholder="Query global network by Subject Title or Absolute Author Name..."
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
        </motion.div>

        {/* Blog Feed Array */}
        <div className="row g-4">
          <AnimatePresence>
            {filteredBlogs.length > 0 ? filteredBlogs.map((blog, idx) => (
              <motion.div 
                key={blog.id} className="col-lg-6"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              >
                <div className="glass-card p-4 h-100 rounded-4 d-flex flex-column" style={{ background: 'rgba(15, 10, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                       <span className="badge bg-dark border border-info border-opacity-50 text-info fw-bold">{blog.tags[0]}</span>
                    </div>
                    <div className="text-white-50 small fw-medium d-flex align-items-center gap-1"><Clock size={14}/> {blog.date}</div>
                  </div>

                  <h4 className="text-white fw-bold mb-3" style={{ textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>{blog.title}</h4>
                  <p className="text-light opacity-75 fw-medium flex-grow-1" style={{ lineHeight: '1.7' }}>{blog.content}</p>

                  <div className="mt-4 pt-3 border-top border-secondary d-flex align-items-center gap-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 35, height: 35 }}>
                      <User size={18} className="text-dark" />
                    </div>
                    <div>
                      <h6 className="m-0 text-white fw-bold">{blog.author}</h6>
                      <small className="text-primary fw-medium">Verified Network Node</small>
                    </div>
                  </div>

                </div>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-12 py-5 text-center">
                 <div className="display-1 text-white-50 opacity-25 mb-4"><Search /></div>
                 <h3 className="text-white fw-bold">No Records Located</h3>
                 <p className="text-white-50">The global grid returned 0 results for your explicit query parameters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
