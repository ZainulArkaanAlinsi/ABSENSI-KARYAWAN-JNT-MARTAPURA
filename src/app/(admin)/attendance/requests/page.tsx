'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { EditRequest } from '@/types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, FileText, AlertCircle, Inbox, Loader2, XCircle } from 'lucide-react';

export default function EditRequestsPage() {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'edit_requests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EditRequest));
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessing(requestId);
    try {
      await updateDoc(doc(db, 'edit_requests', requestId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={36} className="animate-spin text-text-tertiary" />
        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.3em]">
          Loading Requests...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-6 rounded-xl bg-primary/10 border border-border-primary flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-mustard/5 to-transparent pointer-events-none" />
        <div className="w-14 h-14 rounded-xl bg-mustard flex items-center justify-center text-white shadow-md shrink-0 relative z-10">
          <FileText size={28} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-text-primary italic tracking-tight">Request Queue</h2>
          <p className="text-[11px] font-medium text-text-tertiary mt-1">
            {requests.length} pending review
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-primary border border-border-primary rounded-xl p-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-text-tertiary mb-4">
            <Inbox size={32} />
          </div>
          <h4 className="text-base font-bold text-text-primary uppercase tracking-wider mb-1">All Clear</h4>
          <p className="text-[11px] font-medium text-text-tertiary">No pending requests at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.1 }}
                className="bg-primary border border-border-primary rounded-xl p-6 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold text-text-primary group-hover:border-border-hover transition-all border border-border-primary">
                        {req.userName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-text-primary italic uppercase tracking-tight truncate leading-tight">
                          {req.userName}
                        </h3>
                        <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
                          ID: {req.userId.slice(0, 8)}
                        </p>
                      </div>
                      <div
                        className={`ml-auto px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                          req.status === 'pending'
                            ? 'bg-mustard/10 text-mustard border-mustard/20'
                            : req.status === 'approved'
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-pink/10 text-pink border-pink/20'
                        }`}
                      >
                        {req.status === 'pending' ? 'Pending' : req.status === 'approved' ? 'Approved' : 'Rejected'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-secondary border border-border-primary">
                        <p className="text-[8px] font-bold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-2">
                          <AlertCircle size={12} className="text-danger" />
                          Reason
                        </p>
                        <p className="text-sm font-medium text-text-secondary italic">"{req.reason}"</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary border border-border-primary">
                        <p className="text-[8px] font-bold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Clock size={12} className="text-primary" />
                          Submitted
                        </p>
                        <p className="text-sm font-bold text-text-primary">
                          {format(new Date(req.createdAt), 'dd MMM yyyy HH:mm')}
                        </p>
                        <p className="text-[8px] font-medium text-text-tertiary uppercase tracking-wider mt-1">
                          Server time
                        </p>
                      </div>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex md:flex-col justify-center gap-3 md:min-w-[160px]">
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-secondary border border-border-primary text-text-secondary rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-pink/10 hover:text-pink hover:border-pink/30 transition-all disabled:opacity-50"
                      >
                        {processing === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'approved')}
                        disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-success text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-success/90 transition-all disabled:opacity-50 shadow-sm shadow-success/20"
                      >
                        {processing === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}