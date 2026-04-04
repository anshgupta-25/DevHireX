import { Link } from "react-router-dom";
import { MapPin, Clock, Users, Bookmark, ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import type { Job } from "@/lib/types";

/* ─── scroll reveal ─── */
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return { ref, visible };
}

/* ─── animated counter ─── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const { ref, visible } = useReveal();
  useEffect(() => {
    if (!visible) return;
    let cur = 0;
    const inc = Math.max(1, Math.ceil(to / 60));
    const t = setInterval(() => {
      cur = Math.min(cur + inc, to);
      setN(cur);
      if (cur >= to) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [visible, to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ─── Job Card ─── */
function FeaturedJobCard({ job, index }: { job: Job; index: number }) {
  const { ref, visible } = useReveal(index * 80);
  const typeColors: Record<string, { bg: string; text: string }> = {
    "Full-time": { bg: "#dbeafe", text: "#1d4ed8" },
    "Part-time":  { bg: "#fef3c7", text: "#b45309" },
    "Contract":   { bg: "#d1fae5", text: "#065f46" },
    "Internship": { bg: "#ede9fe", text: "#6d28d9" },
    "Remote":     { bg: "#dcfce7", text: "#15803d" },
  };
  const tc = typeColors[job.type] ?? { bg: "#e5e7eb", text: "#374151" };

  return (
    <Link to={`/jobs/${job.id}`}>
      <div
        ref={ref}
        className={`group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-400 cursor-pointer ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Company avatar */}
            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 leading-tight">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
            </div>
          </div>
          <div
            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-indigo-50 hover:border-indigo-300"
            onClick={(e) => e.preventDefault()}
          >
            <Bookmark className="h-3.5 w-3.5 text-gray-500 group-hover:text-indigo-600" />
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />{job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />{job.postedAt}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />{job.applicants} applicants
          </span>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: tc.bg, color: tc.text }}
          >{job.type}</span>
          {job.skills.slice(0, 3).map((s) => (
            <span key={s} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {s}
            </span>
          ))}
        </div>

        {/* Salary */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-bold text-indigo-600">{job.salary}</span>
          <span className="text-xs text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            View Details <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── data ─── */
const features = [
  { icon: "⚡", label: "Real-time Alerts",   desc: "Know the instant your application status changes — zero waiting.",       },
  { icon: "💬", label: "Direct Chat",        desc: "Message founders directly. No gatekeepers, no cold emails.",              },
  { icon: "🛡️", label: "Verified Startups", desc: "Every company is vetted. Apply with total confidence.",                   },
  { icon: "🎯", label: "Smart Matching",     desc: "Your skills, matched to roles that actually fit you.",                    },
  { icon: "🌍", label: "Remote Friendly",    desc: "Filter by remote, hybrid, or in-office. Work from anywhere.",             },
  { icon: "🚀", label: "One-Click Apply",    desc: "Your profile does the talking. Apply to any job in a single click.",      },
];

const stats = [
  { to: 12000, suffix: "+", label: "Active Candidates" },
  { to: 3200,  suffix: "+", label: "Open Positions"    },
  { to: 520,   suffix: "+", label: "Hiring Startups"   },
  { to: 1800,  suffix: "+", label: "Successful Hires"  },
];

const steps = [
  { n: "01", title: "Create Your Profile",  desc: "Sign up in 60 seconds. Add your skills, projects, and let your work shine."  },
  { n: "02", title: "Discover & Apply",     desc: "Browse curated startup roles. One click to apply — no cover letters."         },
  { n: "03", title: "Get Hired",            desc: "Chat with the team directly. Move fast, get offers, start your journey."      },
];

const testimonials = [
  { name: "Priya Sharma",  title: "Frontend Engineer · Groww",    init: "PS", col: "#6366f1", quote: "DevHireX got me hired in just 2 weeks. The real-time alerts kept me on top of every update." },
  { name: "Aryan Mehta",   title: "Recruiter · Razorpay",         init: "AM", col: "#0ea5e9", quote: "The quality of candidates is phenomenal. Verified, motivated, and highly skilled developers."  },
  { name: "Sneha Joshi",   title: "Backend Engineer · Zepto",     init: "SJ", col: "#10b981", quote: "The direct chat feature changed everything. I was talking to the CTO on my very first day."    },
];

export default function Landing() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const h = useReveal(0);
  const f = useReveal(0);
  const s = useReveal(0);
  const j = useReveal(0);
  const t = useReveal(0);
  const c = useReveal(0);

  useEffect(() => {
    api.get("/api/jobs?limit=6").then(r => setFeaturedJobs(r.data)).catch(() => setFeaturedJobs([]));
  }, []);

  return (
    <div className="flex flex-col bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ════════════════════  HERO  ════════════════════ */}
      <section style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 40%, #24243e 100%)", minHeight: "88vh" }}
        className="relative flex items-center overflow-hidden pt-20 pb-28">

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "50px 50px" }} />

        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />

        <div
          ref={h.ref}
          className={`container relative z-10 flex flex-col items-center text-center transition-all duration-800 ${h.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Label pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-5 py-2 text-sm font-medium text-indigo-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            The #1 Startup Hiring Platform in India
          </div>

          {/* Main headline */}
          <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-[72px] font-black tracking-tight leading-[1.05] text-white mb-6">
            Where Startups Meet{" "}
            <br className="hidden sm:block" />
            <span style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #c4b5fd, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Exceptional Talent
            </span>
          </h1>

          <p className="max-w-xl text-lg text-slate-400 leading-relaxed mb-10">
            Connect with India's fastest-growing startups. Apply in real-time, chat with founders directly, and land your dream dev role — faster than ever.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/signup">
              <button className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}>
                Get Started Free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link to="/jobs">
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40">
                Browse Jobs
              </button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 text-sm text-slate-400 mb-16">
            <div className="flex -space-x-2">
              {[["VK","#6366f1"],["AS","#0ea5e9"],["PJ","#10b981"],["RM","#f59e0b"],["NK","#ec4899"]].map(([s,c],i)=>(
                <div key={i} className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: c, borderColor: "#302b63", zIndex: 5-i }}>{s}</div>
              ))}
            </div>
            <span><strong className="text-slate-200">1,800+</strong> developers hired this year</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
            {stats.map((st) => (
              <div key={st.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center hover:border-indigo-400/30 hover:bg-white/8 transition-all duration-300">
                <div className="text-3xl font-black mb-1"
                  style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  <Counter to={st.to} suffix={st.suffix} />
                </div>
                <div className="text-xs text-slate-400">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════  FEATURES  ════════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="container">
          <div ref={f.ref} className={`text-center mb-14 transition-all duration-700 ${f.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Why <span style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>DevHireX</span>?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Everything you need to hire or get hired at the fastest-growing startups. Results, not noise.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, i) => {
              const { ref, visible } = useReveal(i * 60);
              return (
                <div key={feat.label} ref={ref}
                  className={`group bg-white rounded-2xl border border-gray-200 p-7 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                  <div className="text-3xl mb-5">{feat.icon}</div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{feat.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════  FEATURED JOBS  ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container">
          <div ref={j.ref} className={`flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12 transition-all duration-700 ${j.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div>
              <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-2">🔥 Hot Opportunities</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Featured Jobs</h2>
              <p className="mt-2 text-gray-500 text-base">Hand-picked roles from top-tier startups — updated daily.</p>
            </div>
            <Link to="/jobs">
              <button className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 whitespace-nowrap">
                View All Jobs <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium text-gray-500">No jobs posted yet.</p>
              <p className="text-sm mt-1">Be the first recruiter to post a job!</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job, i) => (
                <FeaturedJobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════  HOW IT WORKS  ════════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="container">
          <div ref={s.ref} className={`text-center mb-14 transition-all duration-700 ${s.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Three Steps to Your <span style={{ backgroundImage: "linear-gradient(135deg, #10b981, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Dream Job</span></h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((step, i) => {
              const { ref, visible } = useReveal(i * 120);
              return (
                <div key={step.n} ref={ref}
                  className={`relative flex flex-col items-center text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                  <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-white border-2 border-indigo-100 shadow-lg flex items-center justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <span className="text-2xl font-black" style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{step.n}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block absolute top-10 left-[calc(50%+44px)] right-[calc(-50%+44px)] h-px bg-gradient-to-r from-indigo-200 to-indigo-100" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════  TESTIMONIALS  ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container">
          <div ref={t.ref} className={`text-center mb-14 transition-all duration-700 ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Loved by <span style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Developers</span></h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((tm, i) => {
              const { ref, visible } = useReveal(i * 100);
              return (
                <div key={tm.name} ref={ref}
                  className={`rounded-2xl bg-gray-50 border border-gray-200 p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">"{tm.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${tm.col}, ${tm.col}cc)` }}>{tm.init}</div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{tm.name}</div>
                      <div className="text-xs text-gray-500">{tm.title}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════  CTA  ════════════════════ */}
      <section className="py-24" style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 60%, #24243e 100%)" }}>
        <div className="container">
          <div ref={c.ref} className={`relative rounded-3xl overflow-hidden p-16 text-center border border-white/10 transition-all duration-700 ${c.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)" }}>
            {/* glow */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />

            <div className="relative z-10">
              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-4">🚀 Free to get started</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Ready to Launch Your Career?</h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto mb-10">Join 12,000+ developers and 500+ startups already connecting on DevHireX.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/signup">
                  <button className="inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}>
                    Start for Free
                  </button>
                </Link>
                <Link to="/jobs">
                  <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-10 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40">
                    Explore Jobs <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════  FOOTER  ════════════════════ */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              D
            </div>
            <span className="text-base font-bold text-gray-900">DevHireX</span>
          </div>
          <p className="text-sm text-gray-400">© 2024 DevHireX. All rights reserved. Built with ❤️ for developers.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
