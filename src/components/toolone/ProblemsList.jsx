// ============================================
// ProblemsList.jsx - Only Shows Real Issues (Pass items are hidden)
// ============================================

const getSeverity = (problem) => {
  const normalized = problem.toLowerCase();

  // Check for critical issues (❌)
  if (
    normalized.includes("❌") ||
    normalized.includes("critical") ||
    normalized.includes("error") ||
    normalized.includes("fail") ||
    normalized.includes("unreachable") ||
    normalized.includes("no ssl") ||
    normalized.includes("not secure") ||
    (normalized.includes("missing") && !normalized.includes("⚠️"))
  ) {
    return { label: "Critical", tone: "bg-rose-100 text-rose-700", icon: "❌" };
  }

  // Check for warnings (⚠️)
  if (
    normalized.includes("⚠️") ||
    normalized.includes("average") ||
    normalized.includes("some") ||
    normalized.includes("can be improved") ||
    normalized.includes("consider") ||
    normalized.includes("missing") ||
    normalized.includes("not enabled") ||
    normalized.includes("could not")
  ) {
    return {
      label: "Warning",
      tone: "bg-amber-100 text-amber-700",
      icon: "⚠️",
    };
  }

  // Check for good/pass (✅) - These will be filtered out
  if (
    normalized.includes("✅") ||
    normalized.includes("good") ||
    normalized.includes("detected") ||
    normalized.includes("perfect") ||
    normalized.includes("excellent") ||
    normalized.includes("great") ||
    normalized.includes("pass") ||
    normalized.includes("valid") ||
    normalized.includes("enabled") ||
    normalized.includes("found") ||
    normalized.includes("successful") ||
    normalized.includes("fast") ||
    normalized.includes("all")
  ) {
    return {
      label: "Pass",
      tone: "bg-emerald-100 text-emerald-700",
      icon: "✅",
      isPass: true,
    };
  }

  // Default to info for everything else (ℹ️)
  return { label: "Info", tone: "bg-sky-100 text-sky-700", icon: "ℹ️" };
};

// ============================================
// Get specific fix recommendations for each problem
// ============================================
const getFixRecommendation = (problem) => {
  const lower = problem.toLowerCase();

  // ---- SSL Issues ----
  if (lower.includes("no ssl") || lower.includes("not secure")) {
    return "Install SSL certificate and enforce HTTPS redirects.";
  }
  if (
    lower.includes("ssl certificate is valid") ||
    lower.includes("ssl enabled")
  ) {
    return "✅ SSL is properly configured. Keep certificates updated.";
  }

  // ---- Speed Issues ----
  if (
    lower.includes("slow") ||
    (lower.includes("loading time") && lower.includes("slow"))
  ) {
    return "Optimize images, enable caching, and use a CDN.";
  }
  if (lower.includes("average loading time")) {
    return "Consider image optimization and browser caching.";
  }
  if (lower.includes("fast loading")) {
    return "✅ Great performance! Keep optimizing regularly.";
  }

  // ---- Mobile Issues ----
  if (lower.includes("viewport") && lower.includes("missing")) {
    return "Add viewport meta tag for responsive design.";
  }
  if (lower.includes("mobile")) {
    return "Implement responsive design and test on multiple devices.";
  }

  // ---- SEO Issues ----
  if (lower.includes("title") && lower.includes("missing")) {
    return "Add a descriptive title tag (50-60 characters).";
  }
  if (lower.includes("meta description") && lower.includes("missing")) {
    return "Add meta description (150-160 characters) for SEO.";
  }

  // ---- Alt Text Issues ----
  if (lower.includes("alt") && lower.includes("missing")) {
    return "Add descriptive alt text to all images.";
  }
  if (lower.includes("all") && lower.includes("alt text")) {
    return "✅ All images have proper alt text.";
  }

  // ---- Security Headers ----
  if (lower.includes("x-frame-options") && lower.includes("missing")) {
    return "Add X-Frame-Options header to prevent clickjacking.";
  }
  if (lower.includes("csp") && lower.includes("missing")) {
    return "Implement Content-Security-Policy header.";
  }
  if (lower.includes("hsts") && lower.includes("missing")) {
    return "Enable HSTS for better security.";
  }

  // ---- GZIP Compression ----
  if (lower.includes("gzip") && lower.includes("not enabled")) {
    return "Enable GZIP compression on your server.";
  }
  if (lower.includes("gzip") && lower.includes("enabled")) {
    return "✅ GZIP compression is enabled.";
  }

  // ---- DNS Issues ----
  if (lower.includes("dns") && lower.includes("failed")) {
    return "Check DNS configuration and domain records.";
  }
  if (lower.includes("dns resolution successful")) {
    return "✅ DNS is properly configured.";
  }

  // ---- Domain Quality Issues (NEW) ----
  if (lower.includes("uncommon domain extension")) {
    return "Consider using a more common domain extension (.com, .org, .net).";
  }
  if (lower.includes("domain contains hyphens")) {
    return "Remove hyphens from your domain name for better branding.";
  }
  if (lower.includes("very short domain name")) {
    return "Consider a longer, more descriptive domain name.";
  }
  if (lower.includes("very long domain name")) {
    return "Shorten your domain name for better memorability.";
  }
  if (lower.includes("domain contains numbers")) {
    return "Consider removing numbers for a more professional domain.";
  }

  // ---- Estimated Metrics (NEW) ----
  if (lower.includes("estimated")) {
    return "For accurate results, use Google PageSpeed Insights or GTmetrix.";
  }
  if (lower.includes("cors restricted") || lower.includes("cors")) {
    return "Enable CORS headers or use server-side checks for full analysis.";
  }

  // ---- General Issues ----
  if (lower.includes("could not measure")) {
    return "Check server response time and network conditions.";
  }
  if (lower.includes("additional checks require")) {
    return "Enable CORS or use server-side checks for full analysis.";
  }
  if (lower.includes("accessible") || lower.includes("unreachable")) {
    return "Check if the website is online and accessible.";
  }

  // ---- Default recommendation ----
  return "Review this issue and apply appropriate optimization.";
};

export default function ProblemsList({ problems }) {
  // ============================================
  // Filter out Pass items and summary messages
  // ============================================
  const filteredProblems = problems.filter((p) => {
    const lower = p.toLowerCase();

    // Remove summary messages
    if (
      lower.includes("excellent website performance") ||
      lower.includes("good performance with minor improvements") ||
      lower.includes("moderate issues found") ||
      lower.includes("significant issues found") ||
      lower.includes("critical issues found") ||
      lower.includes("perfect score") ||
      lower.includes("minor issues found") ||
      lower.includes("all checks passed")
    ) {
      return false;
    }

    // Remove Pass items (✅) - these are not issues
    if (
      lower.includes("✅") ||
      (lower.includes("valid") && lower.includes("ssl")) ||
      lower.includes("fast loading") ||
      (lower.includes("enabled") && !lower.includes("not enabled")) ||
      lower.includes("good") ||
      lower.includes("detected") ||
      lower.includes("perfect") ||
      lower.includes("excellent") ||
      lower.includes("great") ||
      lower.includes("successful") ||
      (lower.includes("all") && lower.includes("alt text")) ||
      lower.includes("compression is enabled") ||
      lower.includes("dns resolution successful") ||
      lower.includes("trusted domain extension")
    ) {
      return false;
    }

    // Only keep items that are actual issues (Critical, Warning, or Info)
    return true;
  });

  return (
    <section className="mt-6 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Issue roundup
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Problems to fix
          </h2>
        </div>
        <div className="rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          {filteredProblems.length} items found
        </div>
      </div>

      {filteredProblems.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-emerald-50 px-6 py-5 text-emerald-700 shadow-sm">
          <p className="text-base font-semibold">🎉 No issues detected!</p>
          <p className="mt-1 text-sm text-emerald-600">
            All checks passed. Your website is performing well!
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {filteredProblems.map((problem, index) => {
            const severity = getSeverity(problem);
            const fixRecommendation = getFixRecommendation(problem);

            return (
              <li
                key={index}
                className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[auto_1fr_auto]"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-3xl text-lg ${severity.tone}`}
                >
                  {severity.icon}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{problem}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    <span className="font-medium text-slate-600">
                      Recommended fix:
                    </span>{" "}
                    {fixRecommendation}
                  </p>
                </div>
                <span
                  className={`mt-1 inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-3 text-xs font-semibold ${severity.tone}`}
                >
                  {severity.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}