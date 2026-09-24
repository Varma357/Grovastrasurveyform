'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Edit, Check, X, ShieldAlert, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { localStore, getQuestions, saveQuestion } from '@/lib/db/db';
import { useRole } from '@/components/context/RoleContext';
import { Question } from '@/lib/types';

export default function AdminQuestionsPage() {
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState<'main' | 'optional'>('main');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);
      const data = await getQuestions();
      setQuestions(data);
      setIsLoading(false);
    }
    loadQuestions();
  }, []);

  if (role !== 'ADMIN') {
    return (
      <div className="glass-panel p-8 text-center space-y-3 max-w-lg mx-auto mt-12">
        <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Admin Access Restricted</h3>
        <p className="text-xs text-slate-400">Switch your active role to ADMIN in the top bar to access the Question Bank.</p>
      </div>
    );
  }

  const filteredQuestions = questions.filter(
    (q) => (activeTab === 'main' ? q.question_type === 'Main' : q.question_type === 'Optional')
  );

  const handleToggleActive = async (id: string) => {
    const q = questions.find((x) => x.id === id);
    if (!q) return;

    const updated = { ...q, active: !q.active };
    setQuestions((prev) => prev.map((item) => (item.id === id ? updated : item)));
    await saveQuestion(updated);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const updated = editingQuestion;
    setQuestions((prev) => {
      const exists = prev.some((x) => x.id === updated.id);
      return exists ? prev.map((q) => (q.id === updated.id ? updated : q)) : [updated, ...prev];
    });

    await saveQuestion(updated);
    setEditingQuestion(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-600 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Question Bank & Survey Logic</h2>
          <p className="text-xs text-slate-400">Manage 25 Main and 32 Conditional questions, options, score weights, and feature mappings</p>
        </div>

        <button
          onClick={() => {
            const newQ: Question = {
              id: `q-custom-${Date.now()}`,
              question_code: activeTab === 'main' ? `CUSTOM-M${Date.now().toString().slice(-2)}` : `CUSTOM-O${Date.now().toString().slice(-2)}`,
              category_id: localStore.categories[0].id,
              category_code: 'VERIFY',
              question_type: activeTab === 'main' ? 'Main' : 'Optional',
              question_text: 'Enter your new survey question here...',
              display_order: filteredQuestions.length + 1,
              priority: 1,
              active: true,
              options: [
                { id: 'opt-1', question_id: '', option_label: 'Option 1 (Strong)', score: 0, display_order: 1 },
                { id: 'opt-2', question_id: '', option_label: 'Option 2 (Moderate)', score: 1, display_order: 2 },
                { id: 'opt-3', question_id: '', option_label: 'Option 3 (Significant)', score: 2, display_order: 3 },
              ],
            };
            setEditingQuestion(newQ);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab === 'main' ? 'Main' : 'Conditional'} Question</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-600 space-x-2">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-5 py-2.5 font-bold text-xs rounded-t-xl transition-all border-t border-x ${
            activeTab === 'main'
              ? 'bg-dark-800 text-white border-dark-600 border-b-transparent'
              : 'bg-dark-900/50 text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          MAIN / CORE QUESTIONS ({questions.filter((q) => q.question_type === 'Main').length})
        </button>

        <button
          onClick={() => setActiveTab('optional')}
          className={`px-5 py-2.5 font-bold text-xs rounded-t-xl transition-all border-t border-x ${
            activeTab === 'optional'
              ? 'bg-dark-800 text-white border-dark-600 border-b-transparent'
              : 'bg-dark-900/50 text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          CONDITIONAL / DEEP-DIVE QUESTIONS ({questions.filter((q) => q.question_type === 'Optional').length})
        </button>
      </div>

      {/* Questions Table */}
      <div className="glass-panel p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-dark-900 text-slate-400 border-b border-dark-600 font-semibold">
              <tr>
                <th className="p-3.5 w-28">ID</th>
                <th className="p-3.5 w-24">Category</th>
                <th className="p-3.5 min-w-[280px]">Question Text</th>
                <th className="p-3.5 w-48">Trigger / Condition</th>
                <th className="p-3.5 min-w-[240px]">Scoring Options</th>
                <th className="p-3.5 w-36">Feature Mapping</th>
                <th className="p-3.5 w-24">Status</th>
                <th className="p-3.5 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className={`hover:bg-dark-700/50 transition-colors ${!q.active ? 'opacity-50' : ''}`}>
                  <td className="p-3.5 font-mono font-bold text-indigo-400 shrink-0">{q.question_code}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-900 text-slate-300 border border-dark-600">
                      {q.category_code}
                    </span>
                  </td>
                  <td className="p-3.5 font-extrabold text-white leading-relaxed">{q.question_text}</td>
                  <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                    {q.question_type === 'Main' ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px]">
                        Core (100% Mandatory)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                        {q.trigger_rule ? JSON.stringify(q.trigger_rule) : 'Pain Threshold ≥ 34%'}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <div className="space-y-1">
                      {q.options?.map((opt) => (
                        <div key={opt.id} className="text-[11px] flex items-start space-x-1.5">
                          <span className="font-mono font-bold text-indigo-300 shrink-0">[{opt.score ?? 'N/A'}]</span>
                          <span>{opt.option_label}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px] font-mono">
                    {q.feature_code || 'Mapped to Category'}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleActive(q.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        q.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {q.active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-dark-600 pb-3">
              <h3 className="font-extrabold text-white text-base">Edit Question: {editingQuestion.question_code}</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question Code</label>
                <input
                  type="text"
                  value={editingQuestion.question_code}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_code: e.target.value })}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question Text</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">Answer Options & Scores</label>
                {editingQuestion.options?.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={opt.score ?? 0}
                      onChange={(e) => {
                        const newOpts = [...(editingQuestion.options || [])];
                        newOpts[idx].score = Number(e.target.value);
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="w-16 bg-dark-900 border border-dark-600 rounded p-2 text-white font-mono text-center"
                    />
                    <input
                      type="text"
                      value={opt.option_label}
                      onChange={(e) => {
                        const newOpts = [...(editingQuestion.options || [])];
                        newOpts[idx].option_label = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 bg-dark-900 border border-dark-600 rounded p-2 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-dark-600">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-dark-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow"
                >
                  Save Question Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
