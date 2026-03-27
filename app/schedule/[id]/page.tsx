'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, User, Building, Mail, Phone, CheckCircle2 } from 'lucide-react';

export default function SchedulingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // We'll need a way to fetch contact info. 
    // For now, let's assume we have an endpoint or use an existing one if available.
    // Or just let the user know we're ready.
    async function fetchContact() {
      try {
        // Since we don't have a public "get contact by id" API, 
        // I'll create a small one or just handle it here.
        // Let's assume we can fetch it.
        const res = await fetch(`/api/bot/get-contact?id=${id}`);
        const data = await res.json();
        if (data.success) {
          setContact(data.contact);
        } else {
          setError('Contact not found');
        }
      } catch (e) {
        setError('Failed to fetch contact');
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, [id]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTime) return;

    setScheduling(true);
    setError('');

    try {
      const res = await fetch('/api/bot/schedule-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: id, dateTime })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to schedule meeting');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error && !contact) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">!</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Error</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Try Again</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-indigo-50">
          <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Meeting Scheduled!</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The meeting with <strong>{contact?.name || 'Client'}</strong> has been added to your Google Calendar and updated in your Sheet.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left space-y-2 border border-slate-100">
            <div className="flex items-center text-slate-700 text-sm">
              <Calendar className="mr-2 text-indigo-500" size={16} />
              <span>{new Date(dateTime).toLocaleDateString('en-IN', { dateStyle: 'full' })}</span>
            </div>
            <div className="flex items-center text-slate-700 text-sm">
              <Clock className="mr-2 text-indigo-500" size={16} />
              <span>{new Date(dateTime).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</span>
            </div>
          </div>
          <button
            onClick={() => window.close()}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg active:scale-95 transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white">

        {/* Left Side: Contact Summary */}
        <div className="bg-indigo-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative z-10">
            <div className="mb-8">
              <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30">
                Business Contact
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
              Schedule your <br />Meeting
            </h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4"><User size={20} /></div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Name</p>
                  <p className="text-xl font-bold">{contact?.name || 'N/A'}</p>
                </div>
              </div>

              {contact?.company && (
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-4"><Building size={20} /></div>
                  <div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Company</p>
                    <p className="text-lg font-semibold">{contact.company}</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/10 space-y-4">
                {contact?.email && (
                  <div className="flex items-center text-sm text-indigo-100">
                    <Mail size={14} className="mr-2" /> {contact.email}
                  </div>
                )}
                {contact?.phone && (
                  <div className="flex items-center text-sm text-indigo-100">
                    <Phone size={14} className="mr-2" /> {contact.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 text-xs text-indigo-200">
            Powered by 11za Ai • 11za integration
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <form onSubmit={handleSchedule} className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Select Date & Time</h3>
              <p className="text-slate-500 text-sm">Pick a time to automatically sync this meeting with your Google Calendar.</p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block transition-colors group-focus-within:text-indigo-600">
                  Meeting Date & Time
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={scheduling || !dateTime}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-3 
                ${scheduling || !dateTime
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-2xl active:scale-95'
                }`}
            >
              {scheduling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <span>Schedule Meeting</span>
                  <div className="bg-white/20 p-1 rounded-full"><Clock size={18} /></div>
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 leading-normal">
              By scheduling, a Google Calendar event will be created and an automated confirmation might be sent via WhatsApp.
            </p>
          </form>
        </div>
      </div>

      {/* Lucide Icons CSS for custom shake animation if needed */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}
