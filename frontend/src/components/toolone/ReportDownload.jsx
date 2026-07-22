import { useState, useEffect, useRef } from "react";
import emailjs from '@emailjs/browser';
import axios from 'axios';
import PDFGenerator from './PDFGenerator';
import { Download, Loader2 } from "lucide-react";

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// ============================================
// GRADE METADATA
// ============================================
const gradeMeta = {
  A: { label: "Excellent", bg: [34, 197, 94], text: "#ffffff" },
  B: { label: "Very Good", bg: [34, 197, 94], text: "#ffffff" },
  C: { label: "Average", bg: [245, 158, 11], text: "#ffffff" },
  D: { label: "Needs Improvement", bg: [249, 115, 22], text: "#ffffff" },
  F: { label: "Critical", bg: [239, 68, 68], text: "#ffffff" },
};

const getGradeColor = (grade) => {
  return gradeMeta[grade] || gradeMeta.C;
};

const cleanProblemText = (text) => {
  return String(text)
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// ============================================
// FILTERS - SAME AS PROBLEMSLIST
// ============================================
const filterProblems = (problems) => {
  return problems.filter((p) => {
    const lower = p.toLowerCase();
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
    return true;
  });
};

const getSeverity = (problem) => {
  const normalized = problem.toLowerCase();
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
    return "Critical";
  }
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
    return "Warning";
  }
  return "Info";
};

const getRecommendations = (problemsList) => {
  const recs = [];
  if (!problemsList || problemsList.length === 0) {
    return ["No issues found. Your website is performing well!", "Continue monitoring performance regularly."];
  }

  const realIssues = filterProblems(problemsList);
  if (realIssues.length === 0) {
    recs.push("✅ Continue monitoring performance regularly.");
    recs.push("✅ Maintain good UX and accessibility practices.");
    recs.push("✅ Keep your website's software and plugins updated.");
    return recs;
  }

  const allProblems = realIssues.join(" ").toLowerCase();

  if (allProblems.includes("unreachable") || allProblems.includes("not accessible")) {
    recs.push("🔍 Check if the website is online and accessible.");
    recs.push("🔍 Verify the URL is correct and the server is running.");
    return recs;
  }

  if (allProblems.includes("no ssl") || allProblems.includes("not secure")) {
    recs.push("🔒 Install SSL certificate and enforce HTTPS.");
    recs.push("🔒 Redirect all HTTP traffic to HTTPS.");
  }
  if (allProblems.includes("slow") || allProblems.includes("speed")) {
    recs.push("⚡ Optimize images and enable browser caching.");
    recs.push("⚡ Use a CDN to improve load times globally.");
  }
  if (allProblems.includes("viewport") || allProblems.includes("mobile")) {
    recs.push("📱 Ensure responsive design with viewport meta tags.");
    recs.push("📱 Test on multiple devices and screen sizes.");
  }
  if (allProblems.includes("seo") || allProblems.includes("meta")) {
    recs.push("📝 Create an optimized title tag and meta description.");
    recs.push("📝 Use structured data where appropriate.");
  }
  if (allProblems.includes("alt")) {
    recs.push("🖼️ Add descriptive alt text to all images.");
  }
  if (allProblems.includes("security") || allProblems.includes("header")) {
    recs.push("🛡️ Implement security headers (CSP, X-Frame-Options).");
  }
  if (allProblems.includes("gzip") && allProblems.includes("not enabled")) {
    recs.push("📦 Enable GZIP compression for faster loading.");
  }

  if (recs.length < 3) {
    recs.push("📊 Regularly monitor your website performance.");
    recs.push("🔄 Keep your website software and plugins updated.");
  }

  return [...new Set(recs)].slice(0, 6);
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function ReportDownload({
  url,
  grade,
  score,
  problems,
}) {
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const previousEmailRef = useRef("");
  const gradeColor = getGradeColor(grade);
  const cleanedProblems = problems.map((p) => cleanProblemText(p));

  // ✅ Use PDFGenerator
  const { generatePDF } = PDFGenerator({
    url,
    grade,
    score,
    problems: cleanedProblems,
    realIssueCount: filterProblems(problems).length,
    criticalCount: filterProblems(problems).filter(p => getSeverity(p) === "Critical").length,
    warningCount: filterProblems(problems).filter(p => getSeverity(p) === "Warning").length,
  });

  // ✅ Filter issues for display
  const filteredProblems = filterProblems(problems);
  const realIssueCount = filteredProblems.length;
  const criticalIssues = filteredProblems.filter(p => getSeverity(p) === "Critical");
  const warnings = filteredProblems.filter(p => getSeverity(p) === "Warning");
  const criticalCount = criticalIssues.length;
  const warningCount = warnings.length;

  // ============================================
  // UPLOAD PDF
  // ============================================
  const uploadPDF = async (base64Data, filename) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', blob, filename);

      const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data && response.data.data && response.data.data.url) {
        return response.data.data.url;
      } else {
        throw new Error('Upload failed - no link received');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  };

  // ============================================
  // SEND EMAIL
  // ============================================
  const sendEmailWithPDFLink = async (email) => {
    if (!email) {
      setSendStatus("Please enter your email address.");
      return false;
    }

    setIsSending(true);
    setSendStatus("Generating your report...");

    try {
      const pdfResult = await generatePDF();
      if (!pdfResult || !pdfResult.base64Attachment) {
        throw new Error("Failed to generate PDF");
      }

      setSendStatus("Uploading PDF to secure server...");
      const downloadLink = await uploadPDF(pdfResult.base64Attachment, pdfResult.filename);

      setSendStatus("Sending email with PDF download link...");

      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0] || 'User',
        website_url: url,
        grade: grade,
        score: score,
        issue_count: problems.length,
        audit_date: new Date().toLocaleDateString(),
        download_link: downloadLink,
        report_summary: `Grade: ${grade} | Score: ${score}/100 | Issues: ${problems.length}`,
        message: `Hi,\n\nYour website audit report for ${url} is ready.\n\nGrade: ${grade}\nScore: ${score}/100\nIssues: ${problems.length}\n\nClick the link below to download your PDF report:\n${downloadLink}\n\nThank you for using our service!`,
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', response);
      setSendStatus(`✅ PDF report sent to ${email}`);
      setEmailSent(true);
      previousEmailRef.current = email;
      setEmailInput("");

      return true;
    } catch (error) {
      console.error("Error:", error);
      setSendStatus(`❌ Failed to send report: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setIsSending(false);
      setUploadProgress(0);
    }
  };

  // ============================================
  // HANDLE EMAIL SUBMIT
  // ============================================
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail) {
      // Save to localStorage
      const leads = JSON.parse(localStorage.getItem('leads') || '[]');
      leads.push({ email: trimmedEmail, url, grade, date: new Date().toISOString() });
      localStorage.setItem('leads', JSON.stringify(leads));
      
      // Send email
      sendEmailWithPDFLink(trimmedEmail);
    }
  };

  const handleManualDownload = async () => {
    const result = await generatePDF();
    if (!result || !result.base64Attachment) return;

    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${result.base64Attachment}`;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================
  // SCORE CALCULATION
  // ============================================
  const finalScore = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 50;
  const recommendations = getRecommendations(problems);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side - Report Summary */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-sm p-6 border border-slate-800">
          <span className="inline-flex rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">
            Audit summary
          </span>
          <h1 className="mt-4 text-xl font-semibold leading-tight text-white">
            Export a beautiful website audit report
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Create a ready-to-share PDF with your website grade, issue breakdown, and recommendations in one polished package.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-slate-800/50 p-5 border border-slate-700">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Overall grade
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-lg ${
                  grade === 'A' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30' :
                  grade === 'B' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' :
                  grade === 'C' ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/30' :
                  grade === 'D' ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30' :
                  'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30'
                }`}>
                  {grade}
                </div>
                <div>
                  <p className={`text-lg font-semibold ${
                    grade === 'A' ? 'text-emerald-400' :
                    grade === 'B' ? 'text-blue-400' :
                    grade === 'C' ? 'text-amber-400' :
                    grade === 'D' ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {gradeColor.label}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Score: {finalScore}/100
                  </p>
                </div>
              </div>
            </div>

           
          </div>

          {/* Email Input */}
          <form onSubmit={handleEmailSubmit} className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email to receive the PDF report"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 h-12 rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isSending}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSending ? (
                <>
                  <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Report"
              )}
            </button>
          </form>

          {/* Download Button */}
          <button
            onClick={handleManualDownload}
            className="w-full mt-3 h-12 px-6 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/50 hover:text-white flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Now
          </button>

          {sendStatus && (
            <div className={`mt-3 p-3 rounded-xl text-sm ${
              sendStatus.includes('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              sendStatus.includes('❌') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-slate-800/50 text-slate-400 border border-slate-700'
            }`}>
              {sendStatus}
            </div>
          )}
        </div>

        {/* Right Side - Recommendations */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-sm p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Actionable Recommendations</p>
                <p className="text-xs text-slate-400">Prioritized fixes to improve your website</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-800/50 text-slate-400 text-sm font-bold border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              {recommendations.length} tips
            </span>
          </div>

          <ul className="space-y-3">
            {recommendations.slice(0, 5).map((rec, idx) => {
              const text = rec.replace(/^[^\s]+\s/, '');
              const priority = idx === 0 ? 'High' : idx === 1 ? 'Medium' : 'Low';
              const priorityColors = {
                High: 'bg-red-500/10 text-red-400 border-red-500/20',
                Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              };

              return (
                <li 
                  key={idx} 
                  className="group flex items-start gap-3 rounded-xl bg-slate-800/30 p-3 border border-slate-700 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${
                    idx === 0 ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30' :
                    idx === 1 ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30' :
                    'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-200 leading-relaxed">
                      {text}
                    </span>
                  </div>

                  <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${priorityColors[priority]} flex-shrink-0`}>
                    {priority}
                  </span>
                </li>
              );
            })}
          </ul>

          {recommendations.length > 5 && (
            <div className="mt-4 text-center">
              <span className="text-xs text-slate-500 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-700">
                +{recommendations.length - 5} more recommendations available in full report
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Email Sent Modal */}
      {emailSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="rounded-2xl bg-slate-900 p-8 max-w-md w-full shadow-2xl border border-slate-700">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-center text-xl font-semibold text-white">
              PDF Report Sent!
            </h3>
            <p className="mt-3 text-center text-sm text-slate-400">
              Your website audit report has been sent to:
            </p>
            <p className="mt-2 text-center font-semibold text-indigo-400 break-all">
              {previousEmailRef.current}
            </p>
            <p className="mt-3 text-center text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              📎 <strong className="text-white">Check your inbox</strong><br />
              The PDF download link has been sent to your email.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}