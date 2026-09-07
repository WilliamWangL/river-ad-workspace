'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FeedbackFormProps {
  locale: string;
  /** 反馈来源类型：deal / blog / offer / general */
  sourceType?: string;
  /** 来源页面标识（如 slug 或 URL） */
  sourcePage?: string;
  labels: {
    title: string;
    subtitle: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    errorTitle: string;
    errorMessage: string;
  };
}

const API_BASE = '/app-api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1';

export function FeedbackForm({ sourceType, sourcePage, labels }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const isValid = name.trim() && message.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setStatus('submitting');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/system/feedback/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': TENANT_ID,
        },
        body: JSON.stringify({ name, email, message, sourceType, sourcePage }),
      });

      const json = await res.json();
      if (json.code === 0) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error(json.msg || 'Failed to submit');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  if (status === 'success') {
    return (
      <section className="mt-16">
        <div className="max-w-xl mx-auto text-center p-8 bg-white rounded-2xl border border-green-100 shadow-sm">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold font-display text-foreground mb-2">{labels.successTitle}</h3>
          <p className="text-muted-foreground">{labels.successMessage}</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-4 text-sm text-primary hover:underline font-medium"
          >
            {labels.submit}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">
            {labels.title}
          </h2>
          <p className="text-muted-foreground">{labels.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4"
        >
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error || labels.errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={labels.namePlaceholder}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={labels.emailPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={labels.messagePlaceholder}
            required
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />

          <button
            type="submit"
            disabled={!isValid || status === 'submitting'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {labels.submitting}
              </>
            ) : (
              <>
                <Send size={16} />
                {labels.submit}
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
