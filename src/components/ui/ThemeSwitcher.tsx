'use client';

import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Palette, X } from 'lucide-react';

const themes = [
  { id: 'light', name: 'Light', color: '#06b6d4' },
  { id: 'dark', name: 'Dark', color: '#818cf8' },
  { id: 'technology', name: 'Tech', color: '#00f2fe' },
  { id: 'hacker', name: 'Hacker', color: '#00FF41' },
  { id: 'cyberpunk', name: 'Cyber', color: '#fcee0a' }
] as const;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="position-relative ms-3 z-3">
      <button 
        className="btn btn-outline-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '40px', height: '40px' }}
        title="Switch Theme"
      >
        <Palette size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="position-absolute glass-card p-3 mt-2 end-0 top-100 shadow-lg"
            style={{ minWidth: '180px', zIndex: 1000 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 text-white fw-bold">Select Theme</h6>
              <button className="btn btn-link text-white p-0 border-0" onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="d-flex flex-column gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as any);
                    setIsOpen(false);
                  }}
                  className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 border-0 rounded-3 ${
                    theme === t.id ? 'glass-panel text-white' : 'text-white-50 hover-text-white'
                  }`}
                  style={{ transition: 'all 0.2s', background: theme === t.id ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                >
                  <span 
                    className="rounded-circle d-inline-block" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: t.color,
                      boxShadow: `0 0 10px ${t.color}`
                    }} 
                  />
                  {t.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
