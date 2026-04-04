import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, TrendingUp, Shield, Ban, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Job } from "@/lib/types";

interface AdminUser {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
}

interface PlatformStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalHires: number;
  activeRecruiters: number;
  activeStudents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalJobs: 0, totalApplications: 0, totalHires: 0, activeRecruiters: 0, activeStudents: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, jobsRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/users"),
          api.get("/api/jobs"),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setJobs(jobsRes.data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      // handle error
    }
  };

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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} />
        <StatCard title="Active Jobs" value={stats.totalJobs.toLocaleString()} icon={Briefcase} />
        <StatCard title="Total Applications" value={stats.totalApplications.toLocaleString()} icon={Shield} />
        <StatCard title="Total Hires" value={stats.totalHires.toLocaleString()} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users Management */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.slice(0, 4).map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.status === "flagged" ? "destructive" : "secondary"} className="capitalize text-xs">{u.role}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Ban className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Job Moderation */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Job Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-secondary/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company} · {job.postedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">Active</Badge>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs">Remove</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
