import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Users, Zap, Shield, TrendingUp, CheckCircle } from "lucide-react";
import { JobCard } from "@/components/JobCard";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Job } from "@/lib/types";

const features = [
  { icon: Zap, title: "Real-time Updates", desc: "Instant notifications when your application status changes." },
  { icon: Users, title: "Direct Chat", desc: "Message recruiters directly — no middleman, no delays." },
  { icon: Shield, title: "Verified Startups", desc: "Every company is vetted so you can apply with confidence." },
  { icon: TrendingUp, title: "Smart Matching", desc: "AI-powered matching scores to find your perfect role." },
];

const stats = [
  { value: "12K+", label: "Active Candidates" },
  { value: "3.2K+", label: "Open Positions" },
  { value: "520+", label: "Hiring Startups" },
  { value: "1.8K+", label: "Successful Hires" },
];

export default function Landing() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/api/jobs?limit=3");
        setFeaturedJobs(res.data);
      } catch {
        setFeaturedJobs([]);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(220_80%_56%/0.15),transparent_60%)]" />
        <div className="container relative z-10 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5 text-primary px-4 py-1.5">
            🚀 The #1 Startup Hiring Platform
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: "hsl(220, 14%, 96%)" }}>
            Where Startups Meet <span className="text-gradient">Exceptional Talent</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg" style={{ color: "hsl(220, 10%, 55%)" }}>
            Connect with fast-growing startups, apply in real-time, and land your dream role — all in one modern platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="gap-2 gradient-primary border-0 text-primary-foreground shadow-glow">
                Start Hiring <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button size="lg" variant="outline" className="border-border/30" style={{ color: "hsl(220, 14%, 80%)" }}>
                Browse Jobs
              </Button>
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-gradient">{s.value}</p>
                <p className="mt-1 text-sm" style={{ color: "hsl(220, 10%, 55%)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why HireFlow?</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">Everything you need to hire or get hired at the fastest-growing startups.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Jobs</h2>
              <p className="mt-2 text-muted-foreground">Hot opportunities at top startups</p>
            </div>
            <Link to="/jobs">
              <Button variant="outline" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-secondary/30">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Create Profile", desc: "Sign up and build your profile with skills, experience, and resume." },
              { step: "2", title: "Discover & Apply", desc: "Browse curated startup jobs and apply with one click." },
              { step: "3", title: "Get Hired", desc: "Chat with recruiters in real-time and land your dream role." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground mb-4">{s.step}</div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-2xl gradient-primary p-12 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">Ready to find your next opportunity?</h2>
            <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">Join thousands of candidates and startups already on HireFlow.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  <CheckCircle className="h-4 w-4" /> Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-primary">
              <Briefcase className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold">HireFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 HireFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
