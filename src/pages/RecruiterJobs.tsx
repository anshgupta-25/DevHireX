import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusTimeline } from "@/components/StatusTimeline";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  MessageSquare,
  Eye,
  Loader2,
  Plus,
  UserCheck,
  Calendar,
  ArrowUpRight,
  Tag,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { getUploadUrl } from "@/lib/uploads";
import type { Job, Application } from "@/lib/types";
import PostJobModal from "@/components/dashboards/PostJobModal";

const statusColors: Record<string, string> = {
  Applied: "bg-blue-50 text-blue-700 border-blue-200",
  Shortlisted: "bg-amber-50 text-amber-700 border-amber-200",
  Interview: "bg-purple-50 text-purple-700 border-purple-200",
  Offered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

const statusDotColors: Record<string, string> = {
  Applied: "bg-blue-500",
  Shortlisted: "bg-amber-500",
  Interview: "bg-purple-500",
  Offered: "bg-emerald-500",
  Rejected: "bg-red-500",
};

const statusTransitions: Record<string, string[]> = {
  Applied: ["Shortlisted", "Rejected"],
  Shortlisted: ["Interview", "Rejected"],
  Interview: ["Offered", "Rejected"],
  Offered: [],
  Rejected: [],
};

const jobTypeColors: Record<string, string> = {
  "Full-time": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Part-time": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Contract: "bg-orange-50 text-orange-700 border-orange-200",
  Internship: "bg-pink-50 text-pink-700 border-pink-200",
  Remote: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function RecruiterJobs() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showPostJob, setShowPostJob] = useState(false);

  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  if (user.role !== "recruiter") return <Navigate to="/dashboard" />;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        api.get("/api/jobs?recruiter=me"),
        api.get("/api/applications"),
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.put(`/api/applications/${appId}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: newStatus as Application["status"] }
            : a
        )
      );
    } catch {
      // handle error silently
    }
  };

  const toggleJob = (jobId: string) => {
    setExpandedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedJobs(new Set(filteredJobs.map((j) => j.id)));
  };

  const collapseAll = () => {
    setExpandedJobs(new Set());
  };

  const getJobApplications = (jobId: string) =>
    applications.filter((app) => app.jobId === jobId);

  const getStatusCount = (jobId: string, status: string) =>
    getJobApplications(jobId).filter((app) => app.status === status).length;

  // Filter & Search
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || job.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalApplicants = jobs.reduce((acc, j) => acc + j.applicants, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 absolute -bottom-1 -right-1" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Loading your jobs…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 to-white">
      {/* ─── Compact Header ─── */}
      <div className="border-b border-border/40 bg-white/90 backdrop-blur-sm">
        <div className="container py-4">
          {/* Top row: back + title + stats + CTA */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                title="Back to Dashboard"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </button>
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200/50 shrink-0">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-900">
                  Job Postings
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.company} · Manage listings & applicants
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Inline stats */}
              <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-50/80 border border-border/40">
                <div className="text-center">
                  <p className="text-lg font-black text-indigo-600 leading-tight">{jobs.length}</p>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Jobs</p>
                </div>
                <div className="w-px h-6 bg-border/40" />
                <div className="text-center">
                  <p className="text-lg font-black text-purple-600 leading-tight">{totalApplicants}</p>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Applicants</p>
                </div>
                <div className="w-px h-6 bg-border/40" />
                <div className="text-center">
                  <p className="text-lg font-black text-emerald-600 leading-tight">
                    {applications.filter((a) => a.status === "Shortlisted").length}
                  </p>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Shortlisted</p>
                </div>
              </div>

              <Button
                className="gap-2 gradient-primary border-0 text-primary-foreground h-9 px-4 rounded-lg shadow-md shadow-indigo-200/50 text-sm"
                onClick={() => setShowPostJob(true)}
              >
                <Plus className="h-3.5 w-3.5" /> Post Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border/30">
        <div className="container py-2.5">
          <div className="flex gap-2.5 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search jobs…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-slate-50/80 border-border/50 rounded-lg text-sm focus:bg-white transition-colors"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] h-9 rounded-lg bg-slate-50/80 border-border/50 text-sm">
                <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2.5"
                onClick={expandAll}
              >
                Expand All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2.5"
                onClick={collapseAll}
              >
                Collapse All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Jobs List ─── */}
      <div className="container py-5">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
              <Briefcase className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {searchQuery || filterType !== "all"
                ? "No jobs match your filters"
                : "No jobs posted yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Start building your talent pipeline by posting your first job opening."}
            </p>
            {!searchQuery && filterType === "all" && (
              <Button
                className="gap-2 gradient-primary border-0 text-primary-foreground rounded-xl"
                onClick={() => setShowPostJob(true)}
              >
                <Plus className="h-4 w-4" /> Post Your First Job
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => {
              const jobApps = getJobApplications(job.id);
              const isExpanded = expandedJobs.has(job.id);

              return (
                <div
                  key={job.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleJob(job.id)}
                  >
                    {/* ─── Job Card Header ─── */}
                    <div
                      className={`rounded-2xl border transition-all duration-300 ${isExpanded
                          ? "border-indigo-200/80 shadow-lg shadow-indigo-100/40 bg-white"
                          : "border-border/50 bg-white hover:border-border hover:shadow-md"
                        }`}
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left p-5 sm:p-6 focus:outline-none">
                          <div className="flex items-start gap-4">
                            {/* Job Icon */}
                            <div
                              className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black transition-all duration-300 ${isExpanded
                                  ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/60"
                                  : "bg-indigo-50 text-indigo-600"
                                }`}
                            >
                              {job.title.charAt(0)}
                            </div>

                            {/* Job Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-lg font-bold text-foreground leading-tight">
                                    {job.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {job.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <Clock className="h-3.5 w-3.5" />
                                      Posted {job.postedAt}
                                    </span>
                                    {job.salary && (
                                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        {job.salary}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Chevron */}
                                <ChevronDown
                                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 mt-1 ${isExpanded ? "rotate-180" : ""
                                    }`}
                                />
                              </div>

                              {/* Tags & Summary Row */}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] font-semibold ${jobTypeColors[job.type] || ""
                                    }`}
                                >
                                  {job.type}
                                </Badge>

                                {/* Mini status pills */}
                                <div className="flex items-center gap-1.5 ml-1">
                                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80">
                                    <Users className="h-3 w-3 text-slate-500" />
                                    <span className="text-[11px] font-bold text-slate-600">
                                      {job.applicants}
                                    </span>
                                  </div>
                                  {getStatusCount(job.id, "Shortlisted") >
                                    0 && (
                                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80">
                                        <UserCheck className="h-3 w-3 text-amber-600" />
                                        <span className="text-[11px] font-bold text-amber-600">
                                          {getStatusCount(job.id, "Shortlisted")}
                                        </span>
                                      </div>
                                    )}
                                  {getStatusCount(job.id, "Interview") > 0 && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200/80">
                                      <Calendar className="h-3 w-3 text-purple-600" />
                                      <span className="text-[11px] font-bold text-purple-600">
                                        {getStatusCount(job.id, "Interview")}
                                      </span>
                                    </div>
                                  )}
                                  {getStatusCount(job.id, "Offered") > 0 && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80">
                                      <span className="text-[11px] font-bold text-emerald-600">
                                        ✓ {getStatusCount(job.id, "Offered")}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Skills preview */}
                                {job.skills && job.skills.length > 0 && (
                                  <div className="hidden md:flex items-center gap-1 ml-auto">
                                    {job.skills.slice(0, 3).map((skill) => (
                                      <span
                                        key={skill}
                                        className="text-[10px] font-medium text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {job.skills.length > 3 && (
                                      <span className="text-[10px] text-muted-foreground">
                                        +{job.skills.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </CollapsibleTrigger>

                      {/* ─── Expanded Applicants Section ─── */}
                      <CollapsibleContent>
                        <div className="border-t border-border/40">
                          {/* Applicants Header */}
                          <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-indigo-600" />
                              <h4 className="text-sm font-bold text-foreground">
                                Applicants
                              </h4>
                              <Badge
                                variant="secondary"
                                className="h-5 text-[10px] font-bold"
                              >
                                {jobApps.length}
                              </Badge>
                            </div>

                            {/* Status Filter Pills */}
                            <div className="hidden sm:flex items-center gap-1">
                              {["Applied", "Shortlisted", "Interview", "Offered", "Rejected"].map(
                                (status) => {
                                  const count = getStatusCount(
                                    job.id,
                                    status
                                  );
                                  if (count === 0) return null;
                                  return (
                                    <div
                                      key={status}
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[status]}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${statusDotColors[status]}`}
                                      />
                                      {count} {status}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          {/* Applicants List */}
                          <div className="px-5 sm:px-6 pb-5 space-y-2">
                            {jobApps.length === 0 ? (
                              <div className="text-center py-10 px-4">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                  <Users className="h-7 w-7 text-slate-300" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  No applicants yet for this role
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                  Share this job to attract candidates
                                </p>
                              </div>
                            ) : (
                              jobApps.map((app, appIdx) => (
                                <div
                                  key={app.id}
                                  className="group flex items-center justify-between rounded-xl border border-border/40 p-4 hover:bg-indigo-50/30 hover:border-indigo-200/60 transition-all duration-200 cursor-pointer"
                                  style={{
                                    animationDelay: `${appIdx * 50}ms`,
                                  }}
                                  onClick={() => setSelectedApp(app)}
                                >
                                  <div className="flex items-center gap-3.5">
                                    {/* Avatar */}
                                    {app.studentAvatar ? (
                                      <img
                                        src={getUploadUrl(app.studentAvatar)}
                                        alt={app.studentName}
                                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-border/30"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-bold text-indigo-700 border-2 border-white shadow-sm ring-1 ring-border/30">
                                        {app.studentName.charAt(0)}
                                      </div>
                                    )}

                                    <div>
                                      <p className="text-sm font-semibold text-foreground group-hover:text-indigo-700 transition-colors">
                                        {app.studentName}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-muted-foreground">
                                          Applied {app.appliedAt}
                                        </span>
                                        {app.skills &&
                                          app.skills.length > 0 && (
                                            <div className="hidden md:flex items-center gap-1">
                                              <span className="text-muted-foreground/40">
                                                ·
                                              </span>
                                              {app.skills
                                                .slice(0, 2)
                                                .map((s) => (
                                                  <span
                                                    key={s}
                                                    className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                                                  >
                                                    {s}
                                                  </span>
                                                ))}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {/* Status Badge */}
                                    <Badge
                                      variant="outline"
                                      className={`text-[11px] font-semibold ${statusColors[app.status]}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusDotColors[app.status]}`}
                                      />
                                      {app.status}
                                    </Badge>

                                    {/* Quick Action Buttons */}
                                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-100 hover:text-indigo-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(
                                            `/profile/${app.studentId}`
                                          );
                                        }}
                                        title="View Profile"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-lg hover:bg-purple-100 hover:text-purple-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(
                                            `/messages?contact=${app.studentId}`
                                          );
                                        }}
                                        title="Send Message"
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>

                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-indigo-400 transition-colors" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Post Job Modal ─── */}
      <PostJobModal
        open={showPostJob}
        onClose={() => setShowPostJob(false)}
        onJobCreated={fetchData}
      />

      {/* ─── Applicant Pipeline Dialog ─── */}
      <Dialog
        open={!!selectedApp}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Selection Workflow</DialogTitle>
            <DialogDescription>
              Manage application journey for{" "}
              <span className="font-bold text-foreground">
                {selectedApp?.studentName}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="py-4">
              {/* Candidate Info Card */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl border border-indigo-100/50">
                {selectedApp.studentAvatar ? (
                  <img
                    src={getUploadUrl(selectedApp.studentAvatar)}
                    alt={selectedApp.studentName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center text-indigo-700 text-xl font-black shrink-0 border-2 border-white shadow-sm">
                    {selectedApp.studentName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{selectedApp.studentName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Applying for: {selectedApp.jobTitle}
                  </p>
                </div>
                <Badge
                  className={statusColors[selectedApp.status]}
                  variant="outline"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusDotColors[selectedApp.status]}`}
                  />
                  {selectedApp.status}
                </Badge>
              </div>

              {/* Pipeline Timeline */}
              <div className="px-2 mb-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                  Current Pipeline Position
                </h4>
                <StatusTimeline currentStatus={selectedApp.status} />
              </div>

              {/* Status Actions */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Update Status</h4>
                    <p className="text-xs text-muted-foreground">
                      Move candidate to the next stage
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {statusTransitions[selectedApp.status]?.length > 0 ? (
                      statusTransitions[selectedApp.status].map((next) => (
                        <Button
                          key={next}
                          size="sm"
                          className={`${next === "Rejected"
                              ? "text-destructive border-destructive hover:bg-red-50"
                              : "gradient-primary border-0 text-primary-foreground"
                            } h-8 px-4`}
                          variant={next === "Rejected" ? "outline" : "default"}
                          onClick={() => {
                            handleStatusChange(selectedApp.id, next);
                            setSelectedApp({
                              ...selectedApp,
                              status: next as any,
                            });
                            toast({
                              title: "Status Updated",
                              description: `${selectedApp.studentName} is now ${next}.`,
                            });
                          }}
                        >
                          {next === "Rejected" ? "Reject" : `Move to ${next}`}
                        </Button>
                      ))
                    ) : (
                      <p className="text-xs font-medium text-muted-foreground">
                        Process Complete
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 rounded-xl"
                  onClick={() => {
                    setSelectedApp(null);
                    navigate(`/profile/${selectedApp.studentId}`);
                  }}
                >
                  <Users className="h-4 w-4" /> View Profile
                </Button>
                <Button
                  className="flex-1 gap-2 gradient-primary border-0 text-primary-foreground rounded-xl"
                  onClick={() => {
                    setSelectedApp(null);
                    navigate(`/messages?contact=${selectedApp.studentId}`);
                  }}
                >
                  <MessageSquare className="h-4 w-4" /> Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
