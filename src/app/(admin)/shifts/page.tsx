'use client';

import { Plus, Clock, Edit2, Trash2, Calendar, Settings2, Zap, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Modal from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useShiftManagement, DAYS, SHIFT_COLORS } from '@/hooks/useShiftManagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShiftsPage() {
  const {
    shifts,
    loading,
    showModal,
    setShowModal,
    editingShift,
    form,
    setForm,
    saving,
    openAdd,
    openEdit,
    toggleDay,
    handleSave,
    handleDelete,
    calcDuration,
  } = useShiftManagement();

  return (
    <AdminLayout title="Temporal Protocols" subtitle={`${shifts.length} Operational Nodes Synchronized`}>
      <div className="relative pb-24 px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Dimensional Background Architecture */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-jne-red/5 rounded-full blur-[160px] pointer-events-none animate-pulse -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-[pulse_10s_infinite]" />

        <div className="relative z-10 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10"
          >
            <div className="flex items-center gap-6">
              <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-jne-success shadow-[0_0_10px_#10b981] animate-pulse" />
                <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">
                  Active Nodes: <span className="text-white ml-2">{shifts.filter(s => s.isActive).length}</span>
                </span>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAdd} 
              className="btn-primary"
            >
              <Plus size={18} />
              <span>Initialize Node</span>
            </motion.button>
          </motion.div>

          {loading ? (
            <div className="py-40 flex justify-center">
              <PageLoader />
            </div>
          ) : shifts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card flex flex-col items-center justify-center py-48 rounded-4xl border border-dashed border-white/10"
            >
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-jne-red/10 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 relative z-10">
                  <Clock size={48} strokeWidth={1} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-6">System Idle</h3>
              <p className="text-[12px] font-bold text-white/30 uppercase tracking-[0.4em] text-center max-w-md leading-relaxed mb-12">
                Deployment matrix empty. Re-initiate the temporal operational protocols.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAdd} 
                className="btn-primary"
              >
                Launch Primary Protocol
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {shifts.map((shift, idx) => (
                  <motion.div 
                    key={shift.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -8 }}
                    className="glass-card p-8 rounded-4xl group relative overflow-hidden flex flex-col h-full bg-white/3 hover:bg-white/8 hover:border-white/10 transition-all duration-500"
                  >
                    {/* Shift Spectrum Glow */}
                    <div 
                      className="absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-10 pointer-events-none transition-all duration-700 group-hover:opacity-20 group-hover:scale-125"
                      style={{ background: shift.color }}
                    />

                    {/* Node Header */}
                    <div className="flex items-start justify-between mb-10 relative z-10">
                      <div className="flex items-center gap-5">
                        <div
                          className="flex items-center justify-center rounded-2xl shadow-2xl shadow-black/20 transition-all duration-500 group-hover:rotate-12"
                          style={{ 
                            width: 56, 
                            height: 56, 
                            background: `linear-gradient(135deg, ${shift.color}20 0%, ${shift.color}40 100%)`,
                            border: `1px solid ${shift.color}40`
                          }}
                        >
                          <Clock size={24} style={{ color: shift.color }} strokeWidth={2.5} className="drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-xl tracking-tight leading-none mb-2 uppercase">{shift.name}</h3>
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${shift.isActive ? 'bg-jne-success shadow-[0_0_8px_#10b981]' : 'bg-white/20'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                               {shift.isActive ? 'Operational' : 'Protocol Suspended'}
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2.5">
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEdit(shift)} 
                          className="p-3.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all border border-white/5 shadow-xl backdrop-blur-3xl"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,51,102,0.1)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(shift.id, shift.name)} 
                          className="p-3.5 rounded-xl bg-white/5 text-white/40 hover:text-jne-red hover:border-jne-red/20 transition-all border border-white/5 shadow-xl backdrop-blur-3xl"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Temporal Array */}
                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                      <div className="glass-card border border-white/5 rounded-3xl p-5 text-center bg-black/20 shadow-inner">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Activation</p>
                        <p className="text-3xl font-black text-white tracking-widest tabular-nums">{shift.checkInTime}</p>
                      </div>
                      <div className="glass-card border border-white/5 rounded-3xl p-5 text-center bg-black/20 shadow-inner">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Termination</p>
                        <p className="text-3xl font-black text-white tracking-widest tabular-nums">{shift.checkOutTime}</p>
                      </div>
                    </div>

                    {/* Pulse Metrics */}
                    <div className="flex items-center justify-between px-3 mb-10 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-jne-info border border-white/5">
                          <Zap size={18} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Pulse</span>
                           <span className="text-sm font-black text-white uppercase tracking-tighter">{calcDuration(shift.checkInTime, shift.checkOutTime)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-jne-warning border border-white/5">
                          <Settings2 size={18} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Buffer</span>
                           <span className="text-sm font-black text-white uppercase tracking-tighter">{shift.toleranceMinutes}m Threshold</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Cycle */}
                    <div className="mt-auto flex flex-wrap gap-2.5 relative z-10">
                      {DAYS.map(({ key, label }) => {
                        const isWorking = shift.workingDays.includes(key);
                        return (
                          <div
                            key={key}
                            className={`text-[11px] font-black w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-500 shadow-2xl ${
                              isWorking 
                                ? 'bg-white text-black border-white scale-110 shadow-white/10' 
                                : 'text-white/20 border-white/5 bg-white/3'
                            }`}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingShift ? 'Protocol Configuration' : 'Initialize Operational Node'}
        maxWidth={620}
      >
        <form onSubmit={handleSave} className="space-y-10 py-8">
          <div className="space-y-5">
            <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Descriptor Identifier</label>
            <input 
              className="form-input" 
              placeholder="Ex: Primary Hub Central Alpha" 
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-5">
              <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Activation Pulse</label>
              <input 
                type="time" 
                className="form-input cursor-pointer" 
                value={form.checkInTime}
                onChange={e => setForm(p => ({ ...p, checkInTime: e.target.value }))} 
                required 
              />
            </div>
            <div className="space-y-5">
              <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Termination Pulse</label>
              <input 
                type="time" 
                className="form-input cursor-pointer" 
                value={form.checkOutTime}
                onChange={e => setForm(p => ({ ...p, checkOutTime: e.target.value }))} 
                required 
              />
            </div>
          </div>

          <div className="space-y-5">
            <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Cycle Sync Threshold (Minutes)</label>
            <input 
              type="number" 
              className="form-input" 
              min={0} max={60} 
              value={form.toleranceMinutes}
              onChange={e => setForm(p => ({ ...p, toleranceMinutes: parseInt(e.target.value) || 0 }))} 
            />
          </div>

          <div className="space-y-6">
            <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Operational Cycle Matrix</label>
            <div className="flex gap-3 flex-wrap">
              {DAYS.map(({ key, label }) => {
                const active = form.workingDays.includes(key);
                return (
                  <motion.button
                    key={key}
                    type="button"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDay(key)}
                    className={`w-12 h-12 rounded-2xl text-[11px] font-black transition-all border shadow-2xl ${
                      active 
                        ? 'bg-white text-black border-white shadow-white/20' 
                        : 'bg-white/5 text-white/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Spectrum Identity Code</label>
            <div className="flex gap-5">
              {SHIFT_COLORS.map(c => (
                <motion.button
                  key={c}
                  type="button"
                  whileHover={{ scale: 1.25, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  className="w-11 h-11 rounded-2xl transition-all relative shadow-2xl"
                  style={{ background: c }}
                >
                  <AnimatePresence>
                    {form.color === c && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute -inset-2.5 rounded-3xl border-2 border-white/40 ring-4 ring-white/5" 
                      />
                    )}
                  </AnimatePresence>
                  {form.color === c && <div className="absolute inset-0 flex items-center justify-center text-white"><Zap size={18} /></div>}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-6 pt-10">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1"
            >
              Abort Sync
            </motion.button>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={!saving ? { scale: 1.02, y: -1 } : {}}
              whileTap={!saving ? { scale: 0.97 } : {}}
              className="btn-primary flex-1"
            >
              {saving ? <><Loader2 size={20} className="animate-spin" /> Analyzing...</> : <><Zap size={20} /> Deploy Node</>}
            </motion.button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}


