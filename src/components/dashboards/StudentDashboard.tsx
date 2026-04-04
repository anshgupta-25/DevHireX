import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Send, CheckCircle, Clock, Bookmark, ArrowRight, Loader2, Briefcase, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Application, Job } from "@/lib/types";

const statusColors: Record<string, string> = {
  Applied: "bg-info/10 text-info border-info/20",
  Shortlisted: "bg-warning/10 text-warning border-warning/20",
  Interview: "bg-primary/10 text-primary border-primary/20",
  Offered: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appsRes, jobsRes] = await Promise.all([
          api.get("/api/applications"),
          api.get("/api/jobs?limit=5"),
        ]);
        setMyApps(appsRes.data);
        setOpenJobs(jobsRes.data);
      } catch {
        // fallback to empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map of jobId → application status for quick lookup
  const appliedMap: Record<string, string> = {};
  myApps.forEach((app) => {
    appliedMap[app.jobId] = app.status;
  });

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground">Here's an overview of your job search</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Applications" value={myApps.length} change={`${myApps.length} total`} icon={Send} trend="up" />
        <StatCard title="Shortlisted" value={myApps.filter((a) => a.status === "Shortlisted").length} icon={CheckCircle} />
        <StatCard title="Interviews" value={myApps.filter((a) => a.status === "Interview").length} icon={Clock} />
        <StatCard title="Open Jobs" value={openJobs.length} change="Browse & apply" icon={Briefcase} trend="up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Applications */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <Link to="/jobs"><Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="h-3 w-3" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {myApps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No applications yet. Start applying!</p>
            ) : (
              myApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-bold">
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{app.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">{app.company} · {app.appliedAt}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusColors[app.status]}>{app.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Open Jobs */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Open Jobs</CardTitle>
            <Link to="/jobs"><Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="h-3 w-3" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {openJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No open jobs right now</p>
            ) : (
              openJobs.map((job) => {
                const appStatus = appliedMap[job.id];
                return (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                    <div className="rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/50 hover:border-primary/30">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary shrink-0">
                          {job.company.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{job.title}</p>
                            {appStatus && (
                              <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[appStatus]}`}>{appStatus}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{job.company}</p>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />{job.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/jobs">
          <Button variant="outline" className="gap-2"><Bookmark className="h-4 w-4" /> Browse Jobs</Button>
        </Link>
        <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" /> Edit Profile</Button>
      </div>
    </div>
  );
}
