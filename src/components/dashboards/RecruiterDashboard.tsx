import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, UserCheck, Calendar, Plus, Loader2, Bell } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Job, Application, Notification } from "@/lib/types";
import PostJobModal from "./PostJobModal";

const statusColors: Record<string, string> = {
  Applied: "bg-info/10 text-info border-info/20",
  Shortlisted: "bg-warning/10 text-warning border-warning/20",
  Interview: "bg-primary/10 text-primary border-primary/20",
  Offered: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusTransitions: Record<string, string[]> = {
  Applied: ["Shortlisted", "Rejected"],
  Shortlisted: ["Interview", "Rejected"],
  Interview: ["Offered", "Rejected"],
  Offered: [],
  Rejected: [],
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostJob, setShowPostJob] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, notifsRes] = await Promise.all([
        api.get("/api/jobs?recruiter=me"),
        api.get("/api/applications"),
        api.get("/api/notifications"),
      ]);
      setMyJobs(jobsRes.data);
      setApplications(appsRes.data);
      setNotifications(notifsRes.data);
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for real-time notifications
  useEffect(() => {
    const socket = getSocket();
    const handleNotification = (notif: any) => {
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          userId: user?.id || "",
          title: notif.title,
          message: notif.message,
          type: notif.type || "application",
          read: false,
          createdAt: "Just now",
        },
        ...prev,
      ]);
    };
    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [user?.id]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.put(`/api/applications/${appId}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus as Application["status"] } : a))
      );
    } catch {
      // handle error silently
    }
  };

  const totalApplicants = myJobs.reduce((acc, j) => acc + j.applicants, 0);
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">{user?.company} · Manage your job postings and candidates</p>
        </div>
        <Button className="gap-2 gradient-primary border-0 text-primary-foreground" onClick={() => setShowPostJob(true)}>
          <Plus className="h-4 w-4" /> Post New Job
        </Button>
      </div>

      <PostJobModal open={showPostJob} onClose={() => setShowPostJob(false)} onJobCreated={fetchData} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Active Jobs" value={myJobs.length} icon={Briefcase} />
        <StatCard title="Total Applicants" value={totalApplicants} change={`${totalApplicants} total`} icon={Users} trend="up" />
        <StatCard title="Shortlisted" value={applications.filter(a => a.status === "Shortlisted").length} icon={UserCheck} />
        <StatCard title="Interviews" value={applications.filter(a => a.status === "Interview").length} change="Scheduled" icon={Calendar} trend="up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* My Jobs */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Your Job Postings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No jobs posted yet. Click "Post New Job" to get started.</p>
            ) : (
              myJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.location} · {job.type} · {job.postedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{job.applicants} applicants</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Applicants */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Recent Applicants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No applicants yet.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                      {app.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{app.studentName}</p>
                      <p className="text-xs text-muted-foreground">for {app.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[app.status]}>{app.status}</Badge>
                    {statusTransitions[app.status]?.length > 0 && (
                      <div className="flex gap-1">
                        {statusTransitions[app.status].map((next) => (
                          <Button
                            key={next}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => handleStatusChange(app.id, next)}
                          >
                            {next}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="border-border/50">
        <CardHeader className="flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge className="h-5 px-1.5 text-[10px] gradient-primary border-0 text-primary-foreground">{unreadCount} new</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No notifications yet</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className={`rounded-lg border p-3 ${n.read ? "border-border/50" : "border-primary/20 bg-primary/5"}`}>
                  <div className="flex items-start gap-2">
                    <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.createdAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
