'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Ruler, Scale, Beaker, Calendar, Landmark, ArrowRightLeft } from 'lucide-react';

export default function CosmoCalculator() {
  const [activeTab, setActiveTab] = useState('scientific');

  // Scientific State
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  // Conversion States
  const [convValue, setConvValue] = useState<number | string>('');
  const [convFrom, setConvFrom] = useState('meters');
  const [convTo, setConvTo] = useState('kilometers');

  // Age State
  const [dob, setDob] = useState('');
  const [ageResult, setAgeResult] = useState<{ years: number, months: number, days: number } | null>(null);

  // Financial State
  const [finPrincipal, setFinPrincipal] = useState('');
  const [finRate, setFinRate] = useState('');
  const [finTime, setFinTime] = useState('');
  const [finMode, setFinMode] = useState('simple'); // simple, compound, emi

  const handleCalcClick = (val: string) => {
    if (val === '=') {
      try { 
        const parsed = calcInput
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E');
        setCalcResult(eval(parsed).toString()); 
      } catch { setCalcResult('Error'); }
    } else if (val === 'C') {
      setCalcInput(''); setCalcResult('');
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  const calculateAge = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    setAgeResult({ years, months, days });
  };

  const calculateFinance = () => {
    const P = parseFloat(finPrincipal);
    const R = parseFloat(finRate);
    const T = parseFloat(finTime);
    if (!P || !R || !T) return 0;
    
    if (finMode === 'simple') return (P * R * T) / 100;
    if (finMode === 'compound') return P * Math.pow((1 + R / 100), T) - P;
    if (finMode === 'emi') {
      const r = R / (12 * 100);
      const n = T * 12;
      return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    return 0;
  };

  const getConversionResult = () => {
    const v = parseFloat(convValue as string);
    if (isNaN(v)) return 0;
    // Basic Mock Multipliers
    const rates: Record<string, number> = {
      // Length
      meters: 1, kilometers: 0.001, miles: 0.000621371, feet: 3.28084,
      // Mass
      kilograms: 1, grams: 1000, pounds: 2.20462, ounces: 35.274,
      // Volume
      liters: 1, milliliters: 1000, gallons: 0.264172, cups: 4.22675
    };
    if (rates[convFrom] && rates[convTo]) {
      return (v / rates[convFrom]) * rates[convTo];
    }
    return v;
  };

  return (
    <div className="min-vh-100 py-5 pt-lg-5 mt-5">
      <div className="container mt-4">
        
        {/* Header Array */}
        <motion.div 
          className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 glass-card"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(10, 10, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)' }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary p-3 rounded-circle shadow-lg" style={{ background: 'linear-gradient(135deg, #0dcaf0, #0d6efd)' }}>
               <Calculator size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-white fw-bold mb-1">Cosmo Calculator <span className="text-info fs-5 opacity-75 fw-normal ms-2">Omni-Compute Matrix</span></h2>
              <p className="text-light opacity-75 mb-0 fw-medium small">Executing advanced mathematical frameworks and unified physical conversions.</p>
            </div>
          </div>
        </motion.div>

        <div className="row g-4 d-flex align-items-stretch">
          
          {/* Sidebar Navigation */}
          <div className="col-lg-3">
            <div className="glass-card p-3 rounded-4 h-100 d-flex flex-column gap-2" style={{ background: 'rgba(5, 5, 10, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
               {[
                 { id: 'scientific', icon: Calculator, label: 'Scientific Nexus' },
                 { id: 'length', icon: Ruler, label: 'Length & Distance' },
                 { id: 'mass', icon: Scale, label: 'Mass & Weight' },
                 { id: 'volume', icon: Beaker, label: 'Liquid Volume' },
                 { id: 'age', icon: Calendar, label: 'Age Geometry' },
                 { id: 'finance', icon: Landmark, label: 'Economic Interests' }
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 fw-bold transition-all ${activeTab === tab.id ? 'bg-primary text-dark shadow-lg' : 'text-white-50 hover-bg-dark'}`}
                   style={activeTab === tab.id ? { background: 'linear-gradient(90deg, #0dcaf0, #0d6efd)' } : {}}
                 >
                   <tab.icon size={20} /> {tab.label}
                 </button>
               ))}
            </div>
          </div>

          {/* Compute Visualizer Plane */}
          <div className="col-lg-9">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="glass-card p-4 p-md-5 rounded-4 h-100"
                style={{ background: 'rgba(15, 10, 25, 0.8)', border: '1px solid rgba(0, 242, 254, 0.3)' }}
              >
                
                {/* 1. Scientific Nexus */}
                {activeTab === 'scientific' && (
                  <div className="w-100 mx-auto" style={{ maxWidth: 450 }}>
                    <div className="bg-dark rounded-4 p-4 mb-4 text-end shadow-inner" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-white-50 fs-5 mb-1 text-wrap text-break" style={{ minHeight: '28px' }}>{calcInput || '0'}</div>
                      <div className="text-info display-5 fw-bold" style={{ textShadow: '0 0 15px rgba(0,242,254,0.5)' }}>{calcResult || '= 0'}</div>
                    </div>
                    <div className="row g-2">
                       {['sin(', 'cos(', 'tan(', 'log(', 'ln(', 
                         'sqrt(', '^', '(', ')', 'C',
                         '7','8','9','/','*',
                         '4','5','6','-','+',
                         '1','2','3','π','e',
                         '0','.','='].map(btn => (
                         <div className={btn === '0' || btn === '=' ? "col-6" : "col"} style={{ minWidth: '18%' }} key={btn}>
                           <button 
                             onClick={() => handleCalcClick(btn)}
                             className={`btn w-100 py-2 py-md-3 fw-bold fs-6 shadow-sm rounded-3 ${btn === '=' || btn === 'C' ? 'btn-primary text-dark' : ['/','*','-','+','^'].includes(btn) ? 'btn-outline-info' : ['sin(','cos(','tan(','log(','ln(','sqrt(','π','e'].includes(btn) ? 'btn-outline-secondary text-info' : 'btn-dark text-white hover-bg-light'}`}
                             style={btn === '=' || btn === 'C' ? { background: 'linear-gradient(135deg, #0dcaf0, #0d6efd)', border: 'none' } : {}}
                           >
                             {btn}
                           </button>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* 2. Conversion Mathematics (Length/Mass/Volume) */}
                {['length', 'mass', 'volume'].includes(activeTab) && (
                  <div className="w-100 mx-auto" style={{ maxWidth: 500 }}>
                    <h3 className="text-white fw-bold mb-4 text-center text-capitalize">{activeTab} Interpolation</h3>
                    
                    <div className="d-flex flex-column gap-4">
                      <div className="glass-card p-4 rounded-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <label className="text-info small fw-bold mb-2">Input Vector</label>
                        <div className="d-flex gap-2">
                          <input type="number" className="form-control bg-dark border-secondary text-white shadow-none fs-4" value={convValue} onChange={e => setConvValue(e.target.value)} placeholder="0.00" />
                          <select className="form-select bg-dark border-secondary text-info fw-bold w-50 shadow-none" value={convFrom} onChange={e => setConvFrom(e.target.value)}>
                            {activeTab === 'length' && <><option>meters</option><option>kilometers</option><option>miles</option><option>feet</option></>}
                            {activeTab === 'mass' && <><option>kilograms</option><option>grams</option><option>pounds</option><option>ounces</option></>}
                            {activeTab === 'volume' && <><option>liters</option><option>milliliters</option><option>gallons</option><option>cups</option></>}
                          </select>
                        </div>
                      </div>

                      <div className="d-flex justify-content-center">
                        <div className="p-3 bg-primary rounded-circle shadow-lg text-dark"><ArrowRightLeft size={24}/></div>
                      </div>

                      <div className="glass-card p-4 rounded-4" style={{ background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)' }}>
                        <label className="text-info small fw-bold mb-2">Target Yield</label>
                        <div className="d-flex gap-2 align-items-center">
                          <div className="form-control bg-transparent border-0 text-white shadow-none fs-3 fw-bold">{getConversionResult().toFixed(4)}</div>
                          <select className="form-select bg-dark border-info border-opacity-50 text-info fw-bold w-50 shadow-none" value={convTo} onChange={e => setConvTo(e.target.value)}>
                            {activeTab === 'length' && <><option>meters</option><option>kilometers</option><option>miles</option><option>feet</option></>}
                            {activeTab === 'mass' && <><option>kilograms</option><option>grams</option><option>pounds</option><option>ounces</option></>}
                            {activeTab === 'volume' && <><option>liters</option><option>milliliters</option><option>gallons</option><option>cups</option></>}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Age Geometry */}
                {activeTab === 'age' && (
                  <div className="row g-5 align-items-center">
                    <div className="col-md-6">
                      <h3 className="text-white fw-bold mb-4">Chronological Extraction</h3>
                      <label className="text-info small fw-bold mb-2">Input Birth Coordinates</label>
                      <input type="date" className="form-control bg-dark text-white border-secondary py-3 px-4 rounded-pill shadow-none mb-4" value={dob} onChange={e => setDob(e.target.value)} style={{ colorScheme: 'dark' }} />
                      <button onClick={calculateAge} className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg text-dark" style={{ background: 'linear-gradient(90deg, #ab47bc, #e040fb)' }}>Initialize Chronology</button>
                    </div>
                    <div className="col-md-6 text-center">
                      {ageResult ? (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-4 rounded-4 border-info">
                          <h4 className="text-info fw-bold mb-4">Exact Lifespan Array</h4>
                          <div className="display-4 fw-bold text-white mb-2">{ageResult.years} <span className="fs-5 text-white-50">YRS</span></div>
                          <div className="display-5 fw-bold text-white mb-2">{ageResult.months} <span className="fs-5 text-white-50">MOS</span></div>
                          <div className="display-6 fw-bold text-white">{ageResult.days} <span className="fs-5 text-white-50">DAYS</span></div>
                        </motion.div>
                      ) : (
                        <div className="text-white-50 opacity-50"><Calendar size={100} className="mb-3" /><p>Awaiting coordinates...</p></div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Financial Mathematics */}
                {activeTab === 'finance' && (
                  <div className="row g-5">
                    <div className="col-md-7">
                      <div className="d-flex gap-2 mb-4 p-1 bg-dark rounded-pill border border-secondary">
                        <button onClick={() => setFinMode('simple')} className={`btn flex-grow-1 rounded-pill fw-bold ${finMode === 'simple' ? 'btn-info text-dark shadow' : 'text-white-50'}`}>Simple</button>
                        <button onClick={() => setFinMode('compound')} className={`btn flex-grow-1 rounded-pill fw-bold ${finMode === 'compound' ? 'btn-info text-dark shadow' : 'text-white-50'}`}>Compound</button>
                        <button onClick={() => setFinMode('emi')} className={`btn flex-grow-1 rounded-pill fw-bold ${finMode === 'emi' ? 'btn-info text-dark shadow' : 'text-white-50'}`}>Loan EMI</button>
                      </div>
                      
                      <div className="d-flex flex-column gap-3">
                        <div>
                           <label className="text-info small fw-bold mb-1">Principal Capital (₹)</label>
                           <input type="number" className="form-control bg-dark border-secondary text-white py-2 shadow-none" value={finPrincipal} onChange={e => setFinPrincipal(e.target.value)} />
                        </div>
                        <div>
                           <label className="text-info small fw-bold mb-1">Interest Rate (%)</label>
                           <input type="number" className="form-control bg-dark border-secondary text-white py-2 shadow-none" value={finRate} onChange={e => setFinRate(e.target.value)} />
                        </div>
                        <div>
                           <label className="text-info small fw-bold mb-1">Duration Cycle ({finMode === 'emi' ? 'Years' : 'Years'})</label>
                           <input type="number" className="form-control bg-dark border-secondary text-white py-2 shadow-none" value={finTime} onChange={e => setFinTime(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-5 d-flex align-items-center justify-content-center">
                      <div className="glass-card p-4 w-100 text-center rounded-4" style={{ background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.3)' }}>
                        <Landmark size={48} className="text-info mb-3 opacity-75" />
                        <p className="text-white-50 small fw-bold mb-1 text-uppercase">Projected {finMode === 'emi' ? 'Monthly EMI' : 'Generated Interest'}</p>
                        <h2 className="text-white fw-bold m-0" style={{ textShadow: '0 0 20px rgba(0,242,254,0.4)' }}>₹{calculateFinance().toFixed(2)}</h2>
                        
                        {finMode !== 'emi' && !!finPrincipal && (
                          <div className="mt-4 pt-3 border-top border-secondary">
                            <p className="text-white-50 small fw-bold mb-1">Total Future Yield</p>
                            <h4 className="text-success fw-bold">₹{(parseFloat(finPrincipal) + calculateFinance()).toFixed(2)}</h4>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
