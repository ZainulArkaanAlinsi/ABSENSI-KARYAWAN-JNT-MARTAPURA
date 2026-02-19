'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Users, UserCheck, UserX, Clock, FileText, TrendingUp, AlertCircle, Activity,
  Search, Download, Calendar as CalendarIcon, ChevronDown, MoreHorizontal,
  ArrowUpRight, ShoppingBag, UserPlus
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { subscribeToTodayAttendance, subscribeToLeaves, getEmployees } from '@/lib/firestore';
import type { AttendanceRecord, LeaveRequest, Employee } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Color Palette
const COLORS = ['#00f2fe', '#f9d423', '#ff00cc', '#3333ff'];

const weeklySalesData = [
  { day: 'Mon', sales: 400 },
  { day: 'Tue', sales: 300 },
  { day: 'Wed', sales: 500 },
  { day: 'Thu', sales: 200 },
  { day: 'Fri', sales: 600 },
  { day: 'Sat', sales: 450 },
  { day: 'Sun', sales: 300 },
];

const salesData = [
  { month: '1', value: 200 },
  { month: '2', value: 180 },
  { month: '3', value: 350 },
  { month: '4', value: 300 },
  { month: '5', value: 480 },
  { month: '6', value: 400 },
  { month: '7', value: 550 },
  { month: '8', value: 450 },
  { month: '9', value: 600 },
  { month: '10', value: 520 },
  { month: '11', value: 650 },
  { month: '12', value: 600 },
];

const pieData = [
  { name: 'Facebook', value: 400, color: '#4facfe' },
  { name: 'Youtube', value: 300, color: '#f9d423' },
  { name: 'Instagram', value: 300, color: '#ff00cc' },
  { name: 'Website', value: 200, color: '#16a34a' },
];

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  gradient: string;
  icon: any;
  delay?: number;
}

const PremiumStatCard = ({ title, value, gradient, icon: Icon, delay = 0 }: PremiumStatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative overflow-hidden p-6 rounded-[32px] group cursor-pointer"
    style={{ background: gradient }}
  >
    <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 group-hover:scale-110 transition-transform">
      <Icon size={128} />
    </div>
    <p className="text-black/60 font-semibold text-sm mb-1">{title}</p>
    <p className="text-black text-3xl font-extrabold mb-4">{value}</p>
    <button className="text-black/50 text-xs font-bold border-b border-black/20 hover:text-black transition-colors">
      View entire list
    </button>
  </motion.div>
);

export default function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployees().then(e => {
      setEmployees(e);
      setLoading(false);
    });
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const unsubAttendance = subscribeToTodayAttendance(todayStr, setAttendance);
    return () => unsubAttendance();
  }, []);

  return (
    <AdminLayout title="Dashboard" subtitle="Overview">
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          <header className="mb-2">
            <h2 className="text-3xl font-extrabold text-white">Hello, Admin</h2>
          </header>

          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PremiumStatCard 
              title="Total Karyawan" 
              value={employees.length} 
              gradient="var(--stat-card-gradient-1)" 
              icon={Users} 
              delay={0.1}
            />
            <PremiumStatCard 
              title="Hadir Hari Ini" 
              value={attendance.length} 
              gradient="var(--stat-card-gradient-2)" 
              icon={ShoppingBag} 
              delay={0.2}
            />
            <PremiumStatCard 
              title="Karyawan Baru" 
              value="150" 
              gradient="var(--stat-card-gradient-3)" 
              icon={UserPlus} 
              delay={0.3}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="premium-card p-6 lg:col-span-2"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Attendance Trends</h3>
                <div className="flex gap-2">
                  <button className="bg-zinc-800 p-2 rounded-lg text-zinc-400 hover:text-white transition-colors"><CalendarIcon size={16} /></button>
                  <button className="bg-zinc-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-zinc-700 transition-colors">2023 <ChevronDown size={14} /></button>
                  <button className="btn-premium-yellow px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Download size={14} /> Download</button>
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="month" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#18181b', border: 'none', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
                    <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Calendar Widget */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="premium-card p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Calendar</h3>
                <button className="text-zinc-500 text-sm hover:text-zinc-300">View</button>
              </div>
              <div className="text-center font-bold text-sm bg-zinc-800/50 py-2 rounded-xl mb-4">Feb 2023</div>
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-zinc-500 mb-2 uppercase font-bold">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${i + 1 === 14 ? 'bg-yellow-400 text-black font-bold' : 'hover:bg-zinc-800 text-zinc-300'}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Sales Bar Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="premium-card p-6"
            >
              <h3 className="text-lg font-bold mb-6">Weekly Distribution</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySalesData}>
                    <Bar dataKey="sales" fill="#ff00cc" radius={[6, 6, 0, 0]} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Employee Details Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="premium-card p-6 lg:col-span-2 overflow-x-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Karyawan Terkini</h3>
                <div className="flex gap-2">
                  <button className="bg-zinc-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-zinc-700 transition-colors">Filter <ChevronDown size={14} /></button>
                  <button className="btn-premium-yellow px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Download size={14} /> Download</button>
                </div>
              </div>
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Tanggal</th>
                    <th>Departemen</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 3).map((emp, i) => (
                    <tr key={i}>
                      <td><span className="text-zinc-500">#{emp.employeeId || 'RZ-12'}</span></td>
                      <td className="font-bold">{emp.name}</td>
                      <td className="text-zinc-400">13/01/2026</td>
                      <td className="text-zinc-300">{emp.department}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${i % 2 === 0 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {i % 2 === 0 ? 'Active' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[320px] space-y-8">
          {/* Pie Chart Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="premium-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg"><ShoppingBag size={20} color="white" /></div>
              <div>
                <p className="font-bold text-sm">petshop.com</p>
                <p className="text-[10px] text-zinc-500">(Oreo)</p>
              </div>
            </div>
            
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-black">$10k</span>
                <span className="text-[10px] text-zinc-500">Total</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                  <span className="text-[10px] text-zinc-400">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visitors Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="premium-card p-6 space-y-6"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500">Online Visitors</span>
                <span className="text-lg font-bold">20k</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ duration: 1, delay: 1 }}
                  className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500">Offline Visitors</span>
                <span className="text-lg font-bold">7k</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '35%' }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                />
              </div>
            </div>
          </motion.div>

          {/* Marketing Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="premium-card p-6 bg-linear-to-br from-indigo-600 to-purple-700 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h4 className="font-bold mb-1">Scale Your Performance</h4>
              <p className="text-xs text-white/70 mb-4">Discover advanced analytics tools.</p>
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-transform">Try Premium</button>
            </div>
            <TrendingUp size={100} className="absolute -bottom-4 -right-4 text-white/10 rotate-12" />
          </motion.div>

        </div>
      </div>
    </AdminLayout>
  );
}
