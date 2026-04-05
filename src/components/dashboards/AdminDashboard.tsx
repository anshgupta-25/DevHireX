import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Briefcase, TrendingUp, Shield, Ban, Trash2, Loader2, PlusCircle, Eye, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUploadUrl } from "@/lib/uploads";
import type { Job } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
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

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  recruiter: "bg-blue-100 text-blue-700 border-blue-200",
  student: "bg-green-100 text-green-700 border-green-200",
};

function UserRow({ u, onDelete }: { u: AdminUser; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-3">
        {u.avatar ? (
          <img 
            src={getUploadUrl(u.avatar)} 
            alt={u.name}
            className="h-9 w-9 rounded-full object-cover border border-border"
          />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
            style={{ background: u.role === "admin" ? "#7c3aed" : u.role === "recruiter" ? "#2563eb" : "#16a34a" }}
          >
            {u.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-medium leading-tight">{u.name}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${roleColors[u.role] ?? "bg-gray-100 text-gray-600"}`}>
          {u.role}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <Ban className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(u.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalJobs: 0, totalApplications: 0, totalHires: 0, activeRecruiters: 0, activeStudents: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [viewUsersOpen, setViewUsersOpen] = useState(false);
  const [viewJobsOpen, setViewJobsOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  // Create user form
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", company: "" });
  const [creating, setCreating] = useState(false);

  const { toast } = useToast();

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
    } catch (error: any) {
      toast({
        title: "Admin Sync Failed",
        description: error.response?.data?.message || "Could not retrieve platform data. Check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast({ title: "User removed", description: "The user has been deleted from the platform." });
      setDeleteUserId(null);
    } catch {
      toast({ title: "Error", description: "Could not delete user.", variant: "destructive" });
    }
  };

  const handleRemoveJob = async (jobId: string) => {
    try {
      await api.delete(`/api/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast({ title: "Job removed", description: "The job listing has been removed." });
      setDeleteJobId(null);
    } catch {
      toast({ title: "Error", description: "Could not remove job.", variant: "destructive" });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/api/admin/users", form);
      toast({ title: "User created!", description: `${res.data.user.name} has been added as ${form.role}.` });
      setCreateUserOpen(false);
      setForm({ name: "", email: "", password: "", role: "student", company: "" });
      fetchData(); // refresh list
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Could not create user.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const filterUsers = (role: string) =>
    role === "all" ? users : users.filter((u) => u.role === role);

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>
        <Button onClick={() => setCreateUserOpen(true)} className="gap-2 gradient-primary border-0 text-white">
          <PlusCircle className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} />
        <StatCard title="Active Jobs" value={stats.totalJobs.toLocaleString()} icon={Briefcase} />
        <StatCard title="Total Applications" value={stats.totalApplications.toLocaleString()} icon={Shield} />
        <StatCard title="Total Hires" value={stats.totalHires.toLocaleString()} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Management Card */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">User Management</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setViewUsersOpen(true)}>
              <Eye className="h-3.5 w-3.5" /> View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.slice(0, 4).map((u) => (
              <UserRow key={u.id} u={u} onDelete={setDeleteUserId} />
            ))}
            {users.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No users found.</p>
            )}
          </CardContent>
        </Card>

        {/* Job Moderation Card */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Job Moderation</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setViewJobsOpen(true)}>
              <Eye className="h-3.5 w-3.5" /> View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company} · {job.postedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-green-100 text-green-700 border-green-200">Active</span>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs h-7 px-2" onClick={() => setDeleteJobId(job.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No jobs found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── View All Users Dialog ── */}
      <Dialog open={viewUsersOpen} onOpenChange={setViewUsersOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>All Users ({users.length})</DialogTitle>
            <DialogDescription>Browse and manage all registered platform users by role.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all">
                All <span className="ml-1.5 text-xs bg-secondary rounded-full px-1.5">{users.length}</span>
              </TabsTrigger>
              <TabsTrigger value="admin">
                Admin <span className="ml-1.5 text-xs bg-secondary rounded-full px-1.5">{users.filter(u => u.role === "admin").length}</span>
              </TabsTrigger>
              <TabsTrigger value="recruiter">
                Recruiter <span className="ml-1.5 text-xs bg-secondary rounded-full px-1.5">{users.filter(u => u.role === "recruiter").length}</span>
              </TabsTrigger>
              <TabsTrigger value="student">
                Student <span className="ml-1.5 text-xs bg-secondary rounded-full px-1.5">{users.filter(u => u.role === "student").length}</span>
              </TabsTrigger>
            </TabsList>

            {["all", "admin", "recruiter", "student"].map((tab) => (
              <TabsContent key={tab} value={tab} className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filterUsers(tab).length > 0 ? (
                  filterUsers(tab).map((u) => (
                    <UserRow key={u.id} u={u} onDelete={setDeleteUserId} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No {tab === "all" ? "" : tab} users found.
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          <div className="pt-4 border-t flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{stats.activeStudents} students · {stats.activeRecruiters} recruiters</p>
            <Button size="sm" onClick={() => { setViewUsersOpen(false); setCreateUserOpen(true); }} className="gap-2 gradient-primary border-0 text-white">
              <PlusCircle className="h-3.5 w-3.5" /> Add New User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View All Jobs Dialog ── */}
      <Dialog open={viewJobsOpen} onOpenChange={setViewJobsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>All Job Listings ({jobs.length})</DialogTitle>
            <DialogDescription>Review and moderate all active job postings on the platform.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {jobs.length > 0 ? jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-secondary/30 transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-semibold">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company} · {job.location} · {job.postedAt}</p>
                  {job.salary && <p className="text-xs text-green-600 font-medium mt-0.5">{job.salary}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-green-100 text-green-700 border-green-200">Active</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs h-7 px-2" onClick={() => setDeleteJobId(job.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground text-sm">No jobs on the platform yet.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create User Dialog ── */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the platform with a specific role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="cu-name">Full Name</Label>
                <Input id="cu-name" placeholder="e.g. Ansh Gupta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="cu-email">Email / Username</Label>
                <Input id="cu-email" type="text" placeholder="e.g. ansh@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="cu-password">Password</Label>
                <Input id="cu-password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                        Student
                      </div>
                    </SelectItem>
                    <SelectItem value="recruiter">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                        Recruiter
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.role === "recruiter" && (
                <div className="space-y-1.5">
                  <Label htmlFor="cu-company">Company</Label>
                  <Input id="cu-company" placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              )}
            </div>

            {/* Role info banner */}
            <div className={`rounded-lg p-3 text-xs border ${form.role === "admin" ? "bg-purple-50 border-purple-200 text-purple-700" : form.role === "recruiter" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-green-50 border-green-200 text-green-700"}`}>
              {form.role === "admin" && "⚠️ Admin accounts have full access to manage users, jobs, and platform settings."}
              {form.role === "recruiter" && "📋 Recruiter accounts can post jobs and review candidate applications."}
              {form.role === "student" && "🎓 Student accounts can search jobs and submit applications."}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateUserOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 gradient-primary border-0 text-white" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete User Dialog ── */}
      <Dialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4 border-t mt-2 flex-row-reverse">
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteUserId) handleDeleteUser(deleteUserId);
              }}
            >
              Confirm Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Remove Job Dialog ── */}
      <Dialog open={!!deleteJobId} onOpenChange={(open) => !open && setDeleteJobId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this job listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4 border-t mt-2 flex-row-reverse">
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteJobId) handleRemoveJob(deleteJobId);
              }}
            >
              Confirm Remove
            </Button>
            <Button variant="outline" onClick={() => setDeleteJobId(null)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
