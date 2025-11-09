import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface TopicInputProps {
  onStartResearch: (details: { subject: string; notes: string }) => void;
  loading: boolean;
  error: string | null;
}

const TopicInput: React.FC<TopicInputProps> = ({ onStartResearch, loading, error }) => {
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartResearch({ subject, notes });
  };

  return (
    <div className="w-full max-w-2xl text-center">
      <form onSubmit={handleSubmit} className="mb-4 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left mb-1">
              Subject to Research
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., 'Mooka Stores for passive income'"
              className="w-full px-4 py-3 text-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
              disabled={loading}
              aria-label="Research subject"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left mb-1">
              Special Notes or Considerations (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., 'Focus on the founder's background and credibility...' or paste a custom research methodology."
              className="w-full px-4 py-3 text-base bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow min-h-[100px]"
              disabled={loading}
              aria-label="Special notes for research"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            disabled={loading || !subject.trim()}
            aria-live="polite"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Working...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Start Deep Research</span>
              </>
            )}
          </button>
        </div>
      </form>
      {error && (
        <p className="text-red-500 bg-red-100 dark:bg-red-900/50 border border-red-500 rounded-md px-4 py-2 mt-4">
          {error}
        </p>
      )}
    </div>
  );
};

export default TopicInput;
