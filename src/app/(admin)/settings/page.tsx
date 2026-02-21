'use client';

import { Save, Loader2, Shield, Building, Bell as BellIcon, Globe, MapPin, CheckCircle2, Zap } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useSettingsManagement, TABS } from '@/hooks/useSettingsManagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const {
    activeTab,
    setActiveTab,
    settings,
    loading,
    saving,
    saved,
    update,
    handleSave,
  } = useSettingsManagement();

  if (loading) return <AdminLayout title="System Architecture"><div className="py-32 flex justify-center"><PageLoader /></div></AdminLayout>;

  return (
    <AdminLayout title="System Core" subtitle="Advanced Global Configuration & Secure Protocols">
      <div className="relative pb-24 px-4 sm:px-6 lg:px-8">
        {/* Dynamic Core Ambiance */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-jne-red/8 rounded-full blur-[140px] pointer-events-none animate-[pulse_8s_infinite] -z-10" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-linear-to-br from-indigo-500/8 to-transparent rounded-full blur-[120px] pointer-events-none animate-[pulse_10s_infinite_2s] -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none animate-[pulse_12s_infinite_1s] -z-10" />

        <div className="relative z-10 flex flex-col xl:flex-row gap-8">
          {/* Navigation Matrix */}
          <div className="w-full xl:w-72 shrink-0">
            <div className="glass-premium p-3 space-y-1.5 rounded-2xl sticky top-28 bg-white/3 border border-white/5">
              <div className="px-4 py-3 mb-2 border-b border-white/5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Control Nodes</p>
              </div>
              {TABS.map(tab => (
                <motion.button
                  key={tab.key}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold transition-all text-left uppercase tracking-widest group relative overflow-hidden ${
                    activeTab === tab.key 
                      ? 'text-white' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {activeTab === tab.key && (
                    <motion.div 
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-linear-to-r from-jne-red to-jne-danger shadow-lg shadow-jne-red/20 -z-10"
                    />
                  )}
                  <tab.icon size={16} className={activeTab === tab.key ? 'text-white' : 'group-hover:text-jne-red transition-colors'} />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Main Configuration Content */}
          <div className="flex-1">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="glass-premium p-8 rounded-2xl border border-white/5 bg-white/3 shadow-xl relative min-h-[600px] flex flex-col"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-jne-red/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
              
              <div className="flex-1 space-y-10">
                {/* Dynamic Header */}
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-jne-red border border-white/5 shadow-inner">
                    {activeTab === 'office' && <MapPin size={24} />}
                    {activeTab === 'company' && <Building size={24} />}
                    {activeTab === 'attendance' && <Shield size={24} />}
                    {activeTab === 'notifications' && <BellIcon size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight uppercase leading-none">
                      {TABS.find(t => t.key === activeTab)?.label} Protocol
                    </h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5">Global Parameter Synchronization</p>
                  </div>
                </div>

                <div className="h-px bg-linear-to-r from-white/10 to-transparent" />

                <div className="space-y-6">
                  {/* Office Settings */}
                  {activeTab === 'office' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Entity Nomenclature</label>
                          <input 
                            className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white placeholder:text-(--text-dim)/30 focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                            value={settings.office.name}
                            onChange={e => update('office', 'name', e.target.value)} 
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Geographical Origin</label>
                          <textarea 
                            className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white placeholder:text-(--text-dim)/30 focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner min-h-[140px] resize-none" 
                            value={settings.office.address}
                            onChange={e => update('office', 'address', e.target.value)} 
                          />
                        </div>
                      </div>
                      <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Latitude Axis</label>
                            <input 
                              type="number" step="0.000001" 
                              className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                              value={settings.office.latitude}
                              onChange={e => update('office', 'latitude', parseFloat(e.target.value))} 
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Longitude Axis</label>
                            <input 
                              type="number" step="0.000001" 
                              className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                              value={settings.office.longitude}
                              onChange={e => update('office', 'longitude', parseFloat(e.target.value))} 
                            />
                          </div>
                        </div>
                        <div className="space-y-6 pt-2">
                          <div className="flex justify-between items-center mb-1 px-2">
                            <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] opacity-60">Security Geo-Fence</label>
                            <span className="text-sm font-black text-jne-red tabular-nums">{settings.office.radiusMeters}M</span>
                          </div>
                          <div className="relative h-12 flex items-center px-2">
                            <input 
                              type="range" min={50} max={500} step={10} 
                              className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-jne-red hover:h-2.5 transition-all"
                              value={settings.office.radiusMeters}
                              onChange={e => update('office', 'radiusMeters', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-black text-(--text-dim) uppercase tracking-[0.3em] opacity-40 px-2">
                            <span>Direct Zone (50m)</span><span>Wide Perimeter (500m)</span>
                          </div>
                          <div className="p-5 rounded-[24px] bg-jne-info/5 border border-jne-info/10 text-[10px] font-black text-jne-info tracking-widest flex items-center gap-4 shadow-inner">
                            <div className="w-10 h-10 rounded-xl bg-jne-info/10 flex items-center justify-center shrink-0">
                               <Globe size={18} className="animate-spin-slow" />
                            </div>
                            <span>Global Lock Active: <span className="text-white opacity-60">{settings.office.latitude}, {settings.office.longitude}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company Settings */}
                  {activeTab === 'company' && (
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Nexus Identifier</label>
                          <input 
                            className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                            value={settings.company.companyName}
                            onChange={e => update('company', 'companyName', e.target.value)} 
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Distribution Matrix (APK)</label>
                          <input 
                            className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white placeholder:text-(--text-dim)/30 focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                            placeholder="https://nexus.core.com/download" 
                            value={settings.company.appDownloadUrl}
                            onChange={e => update('company', 'appDownloadUrl', e.target.value)} 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Operational Command Post Email</label>
                          <input 
                            type="email" 
                            className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                            value={settings.company.hrEmail}
                            onChange={e => update('company', 'hrEmail', e.target.value)} 
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Encrypted Voice Channel</label>
                          <input 
                            className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                            value={settings.company.hrPhone}
                            onChange={e => update('company', 'hrPhone', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attendance Settings */}
                  {activeTab === 'attendance' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Biometric Verification Capacity</label>
                          <input 
                            type="number" min={1} max={10} 
                            className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4.5 px-6 text-sm text-white focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                            value={settings.attendance.maxFaceAttempts}
                            onChange={e => update('attendance', 'maxFaceAttempts', parseInt(e.target.value))} 
                          />
                          <p className="text-[9px] text-(--text-dim) font-black uppercase tracking-widest opacity-40 ml-2">Threat Mitigation: Automated Lockout Protocol</p>
                        </div>
                        <div className="space-y-6">
                          <div className="flex justify-between items-center px-2">
                             <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] opacity-60">Recognition Sensitivity</label>
                             <span className="text-sm font-black text-jne-red tabular-nums">{settings.attendance.faceSimilarityThreshold}%</span>
                          </div>
                          <div className="relative h-10 flex items-center px-2">
                            <input 
                              type="range" min={60} max={99} step={1} 
                              className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-jne-red hover:h-2.5 transition-all"
                              value={settings.attendance.faceSimilarityThreshold}
                              onChange={e => update('attendance', 'faceSimilarityThreshold', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-black text-(--text-dim) uppercase tracking-[0.3em] opacity-40 px-2">
                            <span>Flexible Range (60%)</span><span>Cryptographic Strict (99%)</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Access Protocols</label>
                        <div className="space-y-4">
                          {[
                            { key: 'allowOfflineAttendance', label: 'Offline Syncing Protocol', desc: 'Allow data caching when signal integrity drops' },
                            { key: 'overtimeCalculation', label: 'Automated Overdrive Tracking', desc: 'Sync hours with secondary overtime servers' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center justify-between p-6 rounded-[32px] bg-white/2 border border-white/5 cursor-pointer hover:bg-white/5 transition-all group shadow-inner">
                              <div className="max-w-[70%]">
                                <p className="text-xs font-black text-white group-hover:text-jne-red transition-colors uppercase tracking-tight">{item.label}</p>
                                <p className="text-[9px] text-(--text-dim) font-black tracking-widest uppercase mt-1 opacity-40 leading-relaxed">{item.desc}</p>
                              </div>
                              <div className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.attendance[item.key as keyof typeof settings.attendance] ? 'bg-jne-red shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-white/5'}`}>
                                <motion.div 
                                  animate={{ x: settings.attendance[item.key as keyof typeof settings.attendance] ? 32 : 4 }}
                                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg" 
                                />
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={settings.attendance[item.key as keyof typeof settings.attendance] as boolean}
                                  onChange={e => update('attendance', item.key, e.target.checked)}
                                />
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { key: 'notifyOnLeaveRequest', label: 'Auth Request Alerts', desc: 'Monitor new personnel leave submissions' },
                          { key: 'notifyOnFaceEnrollment', label: 'Identity Protocol Ready', desc: 'Confirm biometric registration success' },
                          { key: 'notifyOnFaceFailure', label: 'Breach Attempt Detection', desc: 'Alert on multiple verification failures' },
                          { key: 'notifyOnNewEmployee', label: 'New Agent Activation', desc: 'Register initial login markers' },
                        ].map(item => (
                          <label key={item.key} className="flex items-center justify-between p-6 rounded-[32px] bg-white/2 border border-white/5 cursor-pointer hover:bg-white/5 transition-all group shadow-inner">
                            <div>
                              <p className="text-xs font-black text-white group-hover:text-jne-red transition-colors uppercase tracking-tight">{item.label}</p>
                              <p className="text-[9px] text-(--text-dim) font-black tracking-widest uppercase mt-1 opacity-40 leading-relaxed">{item.desc}</p>
                            </div>
                            <div className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.notifications[item.key as keyof typeof settings.notifications] ? 'bg-jne-red shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-white/5'}`}>
                              <motion.div 
                                animate={{ x: settings.notifications[item.key as keyof typeof settings.notifications] ? 32 : 4 }}
                                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg" 
                              />
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                                onChange={e => update('notifications', item.key, e.target.checked)}
                              />
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      <div className="h-px bg-white/5" />
                      
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <label className="flex items-center gap-6 p-7 rounded-[35px] bg-white/2 border border-white/5 cursor-pointer hover:bg-white/5 transition-all group flex-1 shadow-inner">
                          <div className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.notifications.emailNotifications ? 'bg-jne-red shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-white/5'}`}>
                            <motion.div 
                              animate={{ x: settings.notifications.emailNotifications ? 32 : 4 }}
                              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg" 
                            />
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={settings.notifications.emailNotifications}
                              onChange={e => update('notifications', 'emailNotifications', e.target.checked)}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">Master Operational Feed</p>
                            <p className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.2em] mt-1 opacity-40 leading-relaxed">Relay critical logs to admin commands</p>
                          </div>
                        </label>

                        <AnimatePresence>
                          {settings.notifications.emailNotifications && (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex-1 space-y-4"
                            >
                              <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.4em] ml-2 opacity-60">Command Post Destination</label>
                              <input 
                                type="email" 
                                className="w-full bg-(--bg-input) border border-(--glass-border) rounded-2xl py-4 px-6 text-sm text-white placeholder:text-(--text-dim)/30 focus:outline-none focus:border-jne-red/50 focus:ring-4 focus:ring-jne-red/5 transition-all backdrop-blur-xl shadow-inner" 
                                placeholder="operator@core.net"
                                value={settings.notifications.adminEmail}
                                onChange={e => update('notifications', 'adminEmail', e.target.value)} 
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-10">
                <div className="flex items-center gap-4">
                  <AnimatePresence>
                    {saved && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: -20 }}
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-jne-success/10 text-jne-success border border-jne-success/20 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-jne-success/10"
                      >
                        <div className="w-6 h-6 rounded-full bg-jne-success/20 flex items-center justify-center">
                           <CheckCircle2 size={14} className="animate-bounce" />
                        </div>
                        Protocol Sync Verified
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave} 
                  disabled={saving} 
                  className="btn-primary"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> 
                      <span>Syncing Core...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} /> 
                      <span>Commit Changes</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

