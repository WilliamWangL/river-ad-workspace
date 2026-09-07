'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export default function BlogDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Blog detail page error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-dots-pattern flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Article Loading Error
        </h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          We encountered an issue while loading this article. The content may be
          temporarily unavailable or contain unsupported formatting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
