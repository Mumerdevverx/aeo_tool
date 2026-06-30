import { useState } from 'react';

export default function UrlForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="website-url" className="sr-only">
            Website URL
          </label>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🌐</span>
          <input
            id="website-url"
            type="url"
            placeholder="Enter website URL (e.g. https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-14 w-full rounded-3xl border border-slate-200 bg-slate-50 px-12 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-14 items-center justify-center rounded-3xl bg-linear-to-r from-sky-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {loading ? 'Checking...' : 'Check Website'}
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-500">
        Pro tip: include the full URL with https:// for the most accurate audit results.
      </p>
    </form>
  );
}
