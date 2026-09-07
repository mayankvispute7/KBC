/**
 * AdminPanel — PIN-gated admin panel for question CRUD and Sound settings
 *
 * Accessed via Shift+A → 4-digit PIN prompt.
 * Connected to Prisma via Next.js Server Actions.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Plus, Trash2, Eye, GripVertical, Save, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import type { Question, OptionLetter } from '@/lib/types';
import QuestionPreview from './QuestionPreview';
import {
  verifyAdminPin,
  getQuestions,
  saveQuestion,
  deleteQuestion,
  reorderQuestions,
  getGameSettings,
  saveSoundUrls,
  toggleSoundSetting
} from '@/app/actions/admin';
import { audioManager } from '@/lib/audio';

// ─── PIN Prompt ──────────────────────────────────────────────────────────────

function PinPrompt({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const valid = await verifyAdminPin(pin);
      if (valid) {
        onSuccess();
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setPin('');
    } finally {
      setLoading(false);
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-void/90 z-[70] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-navy-light border-2 border-gold/30 rounded-2xl p-8 max-w-sm w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-title text-xl font-bold text-gold-gradient">Admin Access</h3>
          <button onClick={onClose} className="text-ink-white/50 hover:text-ink-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-neutral-line font-body mb-2">Enter 4-digit PIN:</label>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={`
              w-full bg-navy border-2 rounded-lg p-4 text-center text-2xl font-mono tracking-[0.5em] text-ink-white
              focus:outline-none transition-colors
              ${error ? 'border-danger' : 'border-neutral-line/50 focus:border-gold/50'}
            `}
            autoFocus
            disabled={loading}
            placeholder="• • • •"
          />
          {error && (
            <p className="mt-2 text-sm text-danger font-body text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-6 py-3 bg-gold text-void font-body font-bold rounded-xl hover:bg-gold-bright transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Question Editor ─────────────────────────────────────────────────────────

interface QuestionEditorProps {
  question: Question | null;
  onSave: (q: Question) => Promise<void>;
  onClose: () => void;
}

function QuestionEditor({ question, onSave, onClose }: QuestionEditorProps) {
  const [form, setForm] = useState<Question>(
    question ?? {
      id: `new_${Date.now()}`,
      questionNumber: 0,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOptions: [],
      fiftyFiftyRemove: null,
      fiftyFiftyEligible: true,
      timerDuration: 30,
      audiencePollA: null,
      audiencePollB: null,
      audiencePollC: null,
      audiencePollD: null,
      correctMessage: '',
      wrongMessage: '',
      enabled: true,
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollSum = (form.audiencePollA ?? 0) + (form.audiencePollB ?? 0) +
    (form.audiencePollC ?? 0) + (form.audiencePollD ?? 0);
  const hasPolls = form.audiencePollA !== null || form.audiencePollB !== null || 
                   form.audiencePollC !== null || form.audiencePollD !== null;
  const pollValid = !hasPolls || pollSum === 100;

  const handleCorrectToggle = (letter: OptionLetter) => {
    let current = [...form.correctOptions];
    if (current.includes(letter)) {
      current = current.filter(l => l !== letter);
    } else {
      current.push(letter);
    }
    
    // Automatically adjust fiftyFifty if it becomes invalid
    let fiftyRemove = form.fiftyFiftyRemove ? [...form.fiftyFiftyRemove] : null;
    let fiftyEligible = form.fiftyFiftyEligible;
    
    // Remove if it intersects
    if (fiftyRemove && fiftyRemove.includes(letter)) {
      fiftyRemove = fiftyRemove.filter(l => l !== letter);
    }
    
    // If fewer than 2 incorrect options exist, it's ineligible
    const incorrectCount = 4 - current.length;
    if (incorrectCount < 2) {
      fiftyEligible = false;
      fiftyRemove = null;
    } else {
      fiftyEligible = true;
    }
    
    setForm({ ...form, correctOptions: current, fiftyFiftyRemove: fiftyRemove, fiftyFiftyEligible: fiftyEligible });
  };
  
  const handleFiftyFiftyToggle = (letter: OptionLetter) => {
    let current = form.fiftyFiftyRemove ? [...form.fiftyFiftyRemove] : [];
    if (current.includes(letter)) {
      current = current.filter(l => l !== letter);
    } else {
      if (current.length < 2) {
        current.push(letter);
      } else {
        // Replace the last one if trying to select a 3rd
        current[1] = letter;
      }
    }
    setForm({ ...form, fiftyFiftyRemove: current.length > 0 ? current : null });
  };

  const handleSave = async () => {
    setErrorMsg(null);
    if (!form.questionText || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      setErrorMsg('Question text and all four options are required.');
      return;
    }
    if (form.correctOptions.length === 0) {
      setErrorMsg('At least one correct option must be selected.');
      return;
    }
    if (form.fiftyFiftyEligible && form.fiftyFiftyRemove && form.fiftyFiftyRemove.length > 0 && form.fiftyFiftyRemove.length !== 2) {
      setErrorMsg('50-50 removal must have exactly 2 options selected or 0.');
      return;
    }
    if (!pollValid) {
      setErrorMsg(`Audience poll values must sum to 100 (current sum: ${pollSum}).`);
      return;
    }
    
    setLoading(true);
    try {
      await onSave(form);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {/* Error Message */}
      {errorMsg && (
        <div className="bg-danger/20 border border-danger text-danger-glow p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Question text */}
      <div>
        <label className="block text-sm text-neutral-line font-body mb-1">Question Text *</label>
        <textarea
          className="w-full bg-navy border border-neutral-line/50 rounded-lg p-3 text-ink-white font-body text-sm resize-none focus:border-gold/50 focus:outline-none"
          rows={2}
          value={form.questionText}
          onChange={(e) => setForm({ ...form, questionText: e.target.value })}
        />
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm text-neutral-line font-body mb-2">Options & Answers *</label>
        <div className="space-y-2">
          {(['A', 'B', 'C', 'D'] as OptionLetter[]).map((letter) => {
            const key = `option${letter}` as keyof Question;
            const isCorrect = form.correctOptions.includes(letter);
            return (
              <div key={letter} className="flex items-center gap-3">
                <span className="font-title text-gold w-6">{letter}</span>
                <input
                  className="flex-1 bg-navy border border-neutral-line/50 rounded-lg p-2.5 text-ink-white font-body text-sm focus:border-gold/50 focus:outline-none"
                  value={(form[key] as string) ?? ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={`Option ${letter}`}
                />
                <label className="flex items-center gap-1 text-xs text-neutral-line cursor-pointer shrink-0 w-20">
                  <input
                    type="checkbox"
                    checked={isCorrect}
                    onChange={() => handleCorrectToggle(letter)}
                    className="accent-success w-4 h-4"
                  />
                  Correct
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timer duration */}
        <div>
          <label className="block text-sm text-neutral-line font-body mb-1">Timer (seconds)</label>
          <select
            className="w-full bg-navy border border-neutral-line/50 rounded-lg p-2.5 text-ink-white font-body text-sm focus:border-gold/50 focus:outline-none"
            value={form.timerDuration}
            onChange={(e) => setForm({ ...form, timerDuration: Number(e.target.value) })}
          >
            {[30, 45, 60, 90].map(v => <option key={v} value={v}>{v}s</option>)}
          </select>
        </div>
        
        {/* Enabled Status */}
        <div>
          <label className="block text-sm text-neutral-line font-body mb-1">Status</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, enabled: !form.enabled })}
            className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-colors ${form.enabled ? 'bg-success/10 border-success/30 text-success' : 'bg-neutral-line/10 border-neutral-line/30 text-neutral-line'}`}
          >
            {form.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {form.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
      
      {/* 50-50 Removal */}
      <div className={`p-4 rounded-lg border ${!form.fiftyFiftyEligible ? 'bg-navy/50 border-neutral-line/10 opacity-60' : 'bg-navy-light border-gold/20'}`}>
        <label className="block text-sm text-neutral-line font-body mb-2">
          50-50 Removal (Select exactly 2 incorrect options)
        </label>
        
        {!form.fiftyFiftyEligible ? (
          <p className="text-xs text-danger font-body italic mb-2">50–50 unavailable — fewer than 2 incorrect options</p>
        ) : null}
        
        <div className="flex gap-4">
          {(['A', 'B', 'C', 'D'] as OptionLetter[]).map((letter) => {
            const isCorrect = form.correctOptions.includes(letter);
            const isSelected = form.fiftyFiftyRemove?.includes(letter) || false;
            return (
              <label key={letter} className={`flex items-center gap-1 text-xs cursor-pointer ${isCorrect ? 'text-neutral-line/50' : 'text-ink-white/80'}`}>
                <input
                  type="checkbox"
                  disabled={isCorrect || !form.fiftyFiftyEligible}
                  checked={isSelected}
                  onChange={() => handleFiftyFiftyToggle(letter)}
                  className="accent-gold w-4 h-4 disabled:opacity-50"
                />
                {letter}
              </label>
            );
          })}
        </div>
      </div>

      {/* Audience Poll */}
      <div>
        <label className="block text-sm text-neutral-line font-body mb-1 flex items-center justify-between">
          <span>Audience Poll (%) (Optional)</span>
          {hasPolls && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${pollValid ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger-glow'}`}>
              Total: {pollSum}/100 {pollValid ? '✓' : '⚠️'}
            </span>
          )}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['A', 'B', 'C', 'D'] as OptionLetter[]).map((letter) => {
            const key = `audiencePoll${letter}` as keyof Question;
            return (
              <input
                key={letter}
                type="number"
                min={0}
                max={100}
                className="bg-navy border border-neutral-line/50 rounded-lg p-2 text-ink-white font-body text-sm text-center focus:border-gold/50 focus:outline-none"
                placeholder={letter}
                value={(form[key] as number) ?? ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value ? Number(e.target.value) : null })}
              />
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-neutral-line font-body mb-1">Correct Message (Optional)</label>
          <input
            className="w-full bg-navy border border-neutral-line/50 rounded-lg p-2.5 text-ink-white font-body text-sm focus:border-gold/50 focus:outline-none"
            value={form.correctMessage ?? ''}
            onChange={(e) => setForm({ ...form, correctMessage: e.target.value })}
            placeholder="Shown on correct reveal"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-line font-body mb-1">Wrong Message (Optional)</label>
          <input
            className="w-full bg-navy border border-neutral-line/50 rounded-lg p-2.5 text-ink-white font-body text-sm focus:border-gold/50 focus:outline-none"
            value={form.wrongMessage ?? ''}
            onChange={(e) => setForm({ ...form, wrongMessage: e.target.value })}
            placeholder="Shown on wrong reveal"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-neutral-line/20">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-gold text-void font-body font-bold rounded-xl hover:bg-gold-bright transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Question'}
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2.5 border border-neutral-line text-ink-white/70 font-body rounded-xl hover:border-ink-white/50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Sounds Panel ────────────────────────────────────────────────────────────

const AUDIO_CUES = [
  { id: 'intro', label: 'Intro (Landing)' },
  { id: 'questionReveal', label: 'Question Reveal' },
  { id: 'timerWarning', label: 'Timer Tick (Last 5s)' },
  { id: 'optionSelect', label: 'Option Select' },
  { id: 'lock', label: 'Lock (Lock Kiya Jaye)' },
  { id: 'finalAnswer', label: 'Final Answer Suspense' },
  { id: 'correct', label: 'Correct Answer' },
  { id: 'wrong', label: 'Wrong Answer' },
  { id: 'lifelineUse', label: 'Lifeline Use' },
  { id: 'hotlineConnect', label: 'Hotline Connect' },
  { id: 'finale', label: 'Finale (Winner)' },
];

function SoundsPanel() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    getGameSettings().then(settings => {
      setUrls(settings.soundUrls || {});
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSoundUrls(urls);
      // Update the client-side audio manager
      audioManager.updateCustomUrls(urls);
      setToast({ msg: 'Sound settings saved', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (e: any) {
      setToast({ msg: e.message || 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const playPreview = (cueId: string) => {
    // Temporarily update audio manager to test this specific URL if it changed
    if (urls[cueId]) {
      audioManager.playCustom(cueId, urls[cueId]);
    } else {
      audioManager.play(cueId as any);
    }
  };

  if (loading) return <div className="p-8 text-center text-ink-white/50">Loading sounds...</div>;

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${toast.type === 'success' ? 'bg-success/20 border border-success text-success-glow' : 'bg-danger/20 border border-danger text-danger-glow'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.msg}</span>
        </div>
      )}
      
      <p className="text-sm text-ink-white/60 mb-6">
        Provide valid public URLs for custom audio files (.mp3, .wav). Leave blank to use the default app sounds. Priority cues: Lock, Correct, Wrong.
      </p>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {AUDIO_CUES.map(cue => (
          <div key={cue.id} className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-navy-light/50 border border-neutral-line/30 rounded-xl">
            <div className="w-48 shrink-0">
              <span className="font-body text-sm font-semibold text-gold-gradient">{cue.label}</span>
            </div>
            
            <input
              type="text"
              placeholder="https://... (Leave blank for default)"
              className="flex-1 bg-navy border border-neutral-line/50 rounded-lg p-2 text-ink-white font-body text-sm focus:border-gold/50 focus:outline-none"
              value={urls[cue.id] || ''}
              onChange={(e) => setUrls({ ...urls, [cue.id]: e.target.value })}
            />
            
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => playPreview(cue.id)}
                className="px-3 py-2 bg-neutral-line/20 text-ink-white/80 rounded-lg hover:bg-gold/20 hover:text-gold transition-colors text-xs font-bold"
              >
                ▶ Preview
              </button>
              <button
                onClick={() => setUrls({ ...urls, [cue.id]: '' })}
                className="px-3 py-2 border border-neutral-line/30 text-ink-white/50 rounded-lg hover:bg-danger/10 hover:border-danger/30 hover:text-danger transition-colors text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-neutral-line/20 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gold text-void font-body font-bold rounded-xl hover:bg-gold-bright transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Sounds'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ────────────────────────────────────────────────────────

type Tab = 'questions' | 'sounds';

export default function AdminPanel() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Question | null>(null);
  const [previewing, setPreviewing] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const loadData = useCallback(async () => {
    if (state.adminVerified) {
      setLoading(true);
      const data = await getQuestions();
      setQuestions(data);
      setLoading(false);
    }
  }, [state.adminVerified]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!state.adminOpen) return null;

  // Show PIN prompt if not verified
  if (!state.adminVerified) {
    return (
      <AnimatePresence>
        <PinPrompt
          onSuccess={() => dispatch({ type: 'VERIFY_ADMIN' })}
          onClose={() => dispatch({ type: 'CLOSE_ADMIN' })}
        />
      </AnimatePresence>
    );
  }

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (q: Question) => {
    await saveQuestion(q);
    setEditing(null);
    setIsCreating(false);
    await loadData();
    showToast('Question saved successfully');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this question? This will renumber all subsequent questions.')) {
      await deleteQuestion(id);
      await loadData();
      showToast('Question deleted');
    }
  };
  
  const handleReorder = async (newOrder: Question[]) => {
    // Optimistic UI update
    setQuestions(newOrder);
    // Send to server
    const ids = newOrder.map(q => q.id);
    try {
      await reorderQuestions(ids);
      await loadData(); // Reload to get updated question numbers
      showToast('Order saved');
    } catch (e: any) {
      showToast(e.message || 'Failed to reorder', 'error');
      loadData(); // Revert on failure
    }
  };

  const handleToggleSound = async () => {
    const newVal = !state.soundEnabled;
    dispatch({ type: 'TOGGLE_SOUND' });
    await toggleSoundSetting(newVal);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-void/95 z-[70] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <h2 className="font-title text-2xl md:text-3xl font-bold text-gold-gradient">
              Admin Panel 🔧
            </h2>
            <div className="hidden md:flex bg-navy rounded-lg p-1 border border-neutral-line/30">
              <button
                className={`px-4 py-1.5 rounded-md text-sm font-body transition-colors ${activeTab === 'questions' ? 'bg-gold/20 text-gold' : 'text-ink-white/50 hover:text-ink-white'}`}
                onClick={() => setActiveTab('questions')}
              >
                Questions
              </button>
              <button
                className={`px-4 py-1.5 rounded-md text-sm font-body transition-colors ${activeTab === 'sounds' ? 'bg-gold/20 text-gold' : 'text-ink-white/50 hover:text-ink-white'}`}
                onClick={() => setActiveTab('sounds')}
              >
                Sounds
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSound}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-line/30 text-sm text-ink-white/70 hover:border-gold/30 transition-colors"
            >
              {state.soundEnabled ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-neutral-line" />}
              Sound: {state.soundEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => dispatch({ type: 'CLOSE_ADMIN' })}
              className="w-10 h-10 rounded-full bg-neutral-line/20 flex items-center justify-center text-ink-white/50 hover:text-ink-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden bg-navy rounded-lg p-1 border border-neutral-line/30 mb-6">
          <button
            className={`flex-1 px-4 py-2 rounded-md text-sm font-body transition-colors ${activeTab === 'questions' ? 'bg-gold/20 text-gold' : 'text-ink-white/50'}`}
            onClick={() => setActiveTab('questions')}
          >
            Questions
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-md text-sm font-body transition-colors ${activeTab === 'sounds' ? 'bg-gold/20 text-gold' : 'text-ink-white/50'}`}
            onClick={() => setActiveTab('sounds')}
          >
            Sounds
          </button>
        </div>
        
        {/* Global Toast */}
        {toast && activeTab === 'questions' && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${toast.type === 'success' ? 'bg-success/20 border border-success text-success-glow' : 'bg-danger/20 border border-danger text-danger-glow'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'sounds' ? (
          <SoundsPanel />
        ) : (
          <>
            {/* Editor overlay */}
            {(editing || isCreating) && (
              <div className="mb-8 p-6 rounded-2xl border border-gold/30 bg-navy-light shadow-2xl">
                <h3 className="font-title text-lg font-bold text-gold mb-4">
                  {isCreating ? 'New Question' : `Edit Q${editing?.questionNumber}`}
                </h3>
                <QuestionEditor
                  question={editing}
                  onSave={handleSave}
                  onClose={() => { setEditing(null); setIsCreating(false); }}
                />
              </div>
            )}

            {/* Add button */}
            {!editing && !isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="mb-6 flex items-center gap-2 px-4 py-2.5 bg-gold/10 border border-gold/30 text-gold font-body rounded-xl hover:bg-gold/20 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            )}

            {/* Question list with Reorder */}
            {loading ? (
              <div className="text-center p-8 text-ink-white/50">Loading questions...</div>
            ) : (
              <Reorder.Group axis="y" values={questions} onReorder={handleReorder} className="space-y-3">
                {questions.map((q) => (
                  <Reorder.Item key={q.id} value={q}>
                    <div
                      className={`
                        flex items-center gap-4 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing bg-navy-light/50
                        ${q.enabled ? 'border-neutral-line/30' : 'border-neutral-line/15 opacity-50'}
                      `}
                    >
                      <GripVertical className="w-4 h-4 text-neutral-line/50 flex-shrink-0" />

                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                        <span className="font-title text-sm font-bold text-gold">{q.questionNumber}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-ink-white/80 truncate">{q.questionText}</p>
                        <p className="font-body text-xs text-neutral-line mt-0.5">
                          Ans: {q.correctOptions.join(', ')} • 
                          {q.fiftyFiftyRemove && q.fiftyFiftyRemove.length > 0 ? ` 50/50 removes ${q.fiftyFiftyRemove.join(', ')} • ` : ''} 
                          {q.timerDuration}s
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => setPreviewing(q)}
                          className="p-2 rounded-lg hover:bg-gold/10 text-ink-white/50 hover:text-gold transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => setEditing(q)}
                          className="px-4 py-2 rounded-lg bg-navy border border-neutral-line/30 text-ink-white/80 hover:border-gold/50 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => handleDelete(q.id)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-ink-white/50 hover:text-danger transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-neutral-line/20 pt-8 pb-4">
          <button
            onClick={() => dispatch({ type: 'CLOSE_ADMIN' })}
            className="px-8 py-3 bg-neutral-line/10 border border-neutral-line/30 text-ink-white font-body rounded-xl hover:bg-neutral-line/20 transition-colors shadow-lg"
          >
            Close Admin Panel & Return to Game
          </button>
          <p className="text-xs text-neutral-line/50 font-body">
            Shortcut: Press <kbd className="bg-navy border border-neutral-line/30 rounded px-1">Shift+A</kbd> at any time to toggle this panel.
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewing && (
          <QuestionPreview question={previewing} onClose={() => setPreviewing(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
