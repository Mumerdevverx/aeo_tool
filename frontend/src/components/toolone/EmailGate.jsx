import { useState, useEffect } from 'react';

export default function EmailGate({ url, grade, problems, email, onEmailSubmit }) {
  const [emailInput, setEmailInput] = useState(email || '');

  useEffect(() => {
    setEmailInput(email || '');
  }, [email]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail) {
      const leads = JSON.parse(localStorage.getItem('leads') || '[]');
      leads.push({ email: trimmedEmail, url, grade, date: new Date().toISOString() });
      localStorage.setItem('leads', JSON.stringify(leads));
      onEmailSubmit(trimmedEmail);
    }
  };

  return (
    <section className="mt-6 rounded-4xl border border-slate-200 bg-white px-7 py-8 shadow-[0_30px_60px_-35px_rgba(15,23,42,0.35)]">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-700">
            
            Premium report access
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Download your actionable website audit
          </h2>
        </div>
        {/* <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
          {url ? url : 'Enter a site to continue'}
        </div> */}
      </div>

      <p className="text-slate-500 max-w-2xl leading-7">
        Enter your email and get the complete audit delivered instantly, including grade analysis, issue summary, and recommendations.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label htmlFor="report-email" className="sr-only">
          Email address
        </label>
        <input
          id="report-email"
          type="email"
          placeholder="you@example.com"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="h-14 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          required
        />
        <button
          type="submit"
          className="inline-flex h-14 items-center justify-center rounded-3xl bg-linear-to-r from-sky-600 to-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-700 hover:to-indigo-700"
        >
          Send my report
        </button>
      </form>

      <div className="mt-4 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
        <p className="leading-6">
          We respect your privacy. Your email is stored locally and used only for report delivery. No spam, no third-party sharing.
        </p>
      </div>
    </section>
  );
}