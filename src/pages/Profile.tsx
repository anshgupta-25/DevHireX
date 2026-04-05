import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User as UserIcon,
  MapPin,
  Briefcase,
  Mail,
  Edit3,
  Save,
  X,
  Loader2,
  ArrowLeft,
  Clock,
  MessageSquare,
  GraduationCap,
  Building2,
  ShieldCheck,
  Code2,
  Sparkles,
  Calendar,
  Globe,
  Award,
  Target,
  Users,
  Settings,
  Zap,
  FileText,
  TrendingUp,
  Star,
  ImageIcon,
  LinkIcon,
  Download,
  UploadCloud,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUploadUrl } from "@/lib/uploads";
import { useUploadThing } from "@/lib/uploadthing";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  experience: string;
  skills: string[];
  company: string;
  avatar: string;
  resume: string;
  createdAt: string;
}

const ROLE_CONFIG = {
  student: {
    gradient: "from-slate-800 to-slate-900",
    accentBg: "bg-slate-100",
    accentText: "text-slate-700",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: GraduationCap,
    label: "Student",
    tagline: "Student",
  },
  recruiter: {
    gradient: "from-slate-800 to-slate-900",
    accentBg: "bg-slate-100",
    accentText: "text-slate-700",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Building2,
    label: "Recruiter",
    tagline: "Talent Acquisition",
  },
  admin: {
    gradient: "from-slate-800 to-slate-900",
    accentBg: "bg-slate-100",
    accentText: "text-slate-700",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: ShieldCheck,
    label: "Administrator",
    tagline: "Platform Admin",
  },
};

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [uploadingAvatarState, setUploadingAvatarState] = useState(false);
  const [uploadingResumeState, setUploadingResumeState] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ applications: 0, jobs: 0 });

  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    experience: "",
    skills: "",
    company: "",
    avatar: "",
    resume: "",
  });

  const isOwnProfile = !id || id === authUser?.id;

  const { startUpload: startAvatarUpload, isUploading: isUploadingAvatarUI } = useUploadThing("profileImage");
  const { startUpload: startResumeUpload, isUploading: isUploadingResumeUI } = useUploadThing("resumeFile");

  const uploadingAvatar = isUploadingAvatarUI || uploadingAvatarState;
  const uploadingResume = isUploadingResumeUI || uploadingResumeState;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'resume') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setLoader = type === 'avatar' ? setUploadingAvatarState : setUploadingResumeState;
    setLoader(true);

    try {
      const startUpload = type === 'avatar' ? startAvatarUpload : startResumeUpload;
      const uploadRes = await startUpload([file]);
      if (!uploadRes || uploadRes.length === 0) throw new Error("UploadFailed");

      const fileUrl = uploadRes[0].url;
      const fieldName = type === 'avatar' ? 'avatar' : 'resume';
      
      const payload = { ...form, [fieldName]: fileUrl, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) };
      const res = await api.put("/api/profile", payload);
      
      const updatedUser = res.data.user;
      setProfile(updatedUser);
      setForm(prev => ({ ...prev, avatar: updatedUser.avatar || "", resume: updatedUser.resume || "" }));
      if (isOwnProfile) {
        updateUser(updatedUser);
      }
      
      toast({ title: "Success", description: "File uploaded successfully!" });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "There was an error uploading the file.",
        variant: "destructive"
      });
    } finally {
      setLoader(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const endpoint = isOwnProfile ? "/api/profile" : `/api/profile/${id}`;
        const res = await api.get(endpoint);
        setProfile(res.data.user);
        setForm({
          name: res.data.user.name || "",
          bio: res.data.user.bio || "",
          location: res.data.user.location || "",
          experience: res.data.user.experience || "",
          skills: (res.data.user.skills || []).join(", "),
          company: res.data.user.company || "",
          avatar: res.data.user.avatar || "",
          resume: res.data.user.resume || "",
        });
      } catch {
        toast({ title: "Error", description: "Could not load profile.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwnProfile]);

  useEffect(() => {
    if (!isOwnProfile || !authUser) return;
    const fetchStats = async () => {
      try {
        if (authUser.role === "student") {
          const res = await api.get("/api/applications/my");
          setStats({ applications: res.data.length || 0, jobs: 0 });
        } else if (authUser.role === "recruiter") {
          const res = await api.get("/api/jobs/my");
          setStats({ applications: 0, jobs: res.data.length || 0 });
        }
      } catch { /* stats optional */ }
    };
    fetchStats();
  }, [isOwnProfile, authUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) };
      const res = await api.put("/api/profile", payload);
      setProfile(res.data.user);
      setEditOpen(false);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <UserIcon className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground mb-4">Profile not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const role = (profile.role as keyof typeof ROLE_CONFIG) || "student";
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;
  const RoleIcon = config.icon;
  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="container py-8 max-w-4xl">
      {!isOwnProfile && (
        <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      )}

      {/* ── Profile Header ── */}
      <Card className="border-border/50 mb-6 shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar block */}
            <div className="flex-shrink-0 relative group">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-secondary shadow-sm flex items-center justify-center border-4 border-background overflow-hidden relative">
                {profile.avatar ? (
                  <img src={getUploadUrl(profile.avatar)} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl md:text-5xl font-black text-slate-700">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
                
                {isOwnProfile && (
                  <>
                    <label htmlFor="hero-avatar-upload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                      {uploadingAvatar ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <UploadCloud className="h-6 w-6 text-white" />
                      )}
                    </label>
                    <Input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      className="hidden"
                      id="hero-avatar-upload"
                      onChange={(e) => handleFileUpload(e, 'avatar')}
                      disabled={uploadingAvatar}
                    />
                  </>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{profile.name}</h1>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      <RoleIcon className="h-3.5 w-3.5 mr-1.5" /> {config.label}
                    </Badge>
                    {profile.company && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" /> {profile.company}
                      </span>
                    )}
                    {profile.location && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {profile.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto">
                  {isOwnProfile ? (
                    <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => setEditOpen(true)}>
                      <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                  ) : (
                    <Button className="gap-2 w-full sm:w-auto gradient-primary border-0 text-primary-foreground" onClick={() => navigate(`/messages?contact=${profile._id}`)}>
                      <MessageSquare className="h-3.5 w-3.5" /> Send Message
                    </Button>
                  )}
                </div>
              </div>
              
              {profile.bio && <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">{profile.bio}</p>}

              <div className="flex flex-wrap gap-3 mt-4">
                {profile.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 rounded-full px-3 py-1">
                    <Mail className="h-3.5 w-3.5" /> {profile.email}
                  </div>
                )}
                {profile.experience && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 rounded-full px-3 py-1">
                    <Clock className="h-3.5 w-3.5" /> {profile.experience}
                  </div>
                )}
                {joinDate && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 rounded-full px-3 py-1">
                    <Calendar className="h-3.5 w-3.5" /> Joined {joinDate}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Role-specific content ── */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Skills (all roles) */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="border-border/50 shadow-sm md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg ${config.accentBg} flex items-center justify-center`}>
                  <Code2 className={`h-3.5 w-3.5 ${config.accentText}`} />
                </div>
                {role === "recruiter" ? "Tech Stack & Expertise" : "Skills & Technologies"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-xs font-medium hover:scale-105 transition-transform cursor-default">
                    <Sparkles className="h-3 w-3 mr-1.5 opacity-50" /> {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STUDENT sections ── */}
        {role === "student" && (
          <>
            {isOwnProfile && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    My Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                      <div className="text-3xl font-bold text-emerald-600">{stats.applications}</div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><FileText className="h-3 w-3" /> Applications</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
                      <div className="text-3xl font-bold text-cyan-600">{profile.skills?.length || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Star className="h-3 w-3" /> Skills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Target className="h-3.5 w-3.5 text-teal-600" />
                  </div>
                  Career Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <GraduationCap className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div><p className="text-sm font-medium">Education</p><p className="text-xs text-muted-foreground">{profile.experience || "Not specified"}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Globe className="h-5 w-5 text-cyan-500 shrink-0" />
                    <div><p className="text-sm font-medium">Location</p><p className="text-xs text-muted-foreground">{profile.location || "Not specified"}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Award className="h-5 w-5 text-amber-500 shrink-0" />
                    <div><p className="text-sm font-medium">Status</p><p className="text-xs text-muted-foreground">{profile.bio ? "Active student" : "Open to opportunities"}</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── RECRUITER sections ── */}
        {role === "recruiter" && (
          <>
            {isOwnProfile && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    Recruiting Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                      <div className="text-3xl font-bold text-blue-600">{stats.jobs}</div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Briefcase className="h-3 w-3" /> Jobs Posted</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                      <div className="text-3xl font-bold text-violet-600">{profile.skills?.length || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Zap className="h-3 w-3" /> Tech Areas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
                    <div><p className="text-sm font-medium">Company</p><p className="text-xs text-muted-foreground">{profile.company || "Not specified"}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Users className="h-5 w-5 text-indigo-500 shrink-0" />
                    <div><p className="text-sm font-medium">Role</p><p className="text-xs text-muted-foreground">Talent Acquisition Specialist</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Globe className="h-5 w-5 text-violet-500 shrink-0" />
                    <div><p className="text-sm font-medium">Location</p><p className="text-xs text-muted-foreground">{profile.location || "Not specified"}</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── ADMIN sections ── */}
        {role === "admin" && (
          <>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Settings className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  Admin Privileges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <ShieldCheck className="h-5 w-5 text-purple-500 shrink-0" />
                    <div><p className="text-sm font-medium">Access Level</p><p className="text-xs text-muted-foreground">Full Platform Access</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Users className="h-5 w-5 text-fuchsia-500 shrink-0" />
                    <div><p className="text-sm font-medium">Manage Users</p><p className="text-xs text-muted-foreground">Students, Recruiters & Jobs</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                    <Zap className="h-5 w-5 text-pink-500 shrink-0" />
                    <div><p className="text-sm font-medium">Platform Controls</p><p className="text-xs text-muted-foreground">Analytics, Reports & Settings</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-fuchsia-600" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11" onClick={() => navigate("/admin")}>
                    <ShieldCheck className="h-4 w-4 text-purple-500" /> Go to Admin Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-11" onClick={() => navigate("/messages")}>
                    <MessageSquare className="h-4 w-4 text-blue-500" /> View Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Account Info (all roles) ── */}
        <Card className="border-border/50 shadow-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className={`h-7 w-7 rounded-lg ${config.accentBg} flex items-center justify-center`}>
                <UserIcon className={`h-3.5 w-3.5 ${config.accentText}`} />
              </div>
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Email</p>
                  <p className="text-sm font-medium truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                <RoleIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Role</p>
                  <p className="text-sm font-medium capitalize">{config.label}</p>
                </div>
              </div>
              {profile.company && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Company</p>
                    <p className="text-sm font-medium">{profile.company}</p>
                  </div>
                </div>
              )}
              {joinDate && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Member Since</p>
                    <p className="text-sm font-medium">{joinDate}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resume card */}
        {profile.resume && (
          <Card className="border-border/50 shadow-sm md:col-span-2">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${config.accentBg} flex items-center justify-center`}>
                    <FileText className={`h-5 w-5 ${config.accentText}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Resume</p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                </div>
                <a href={getUploadUrl(profile.resume)} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-3.5 w-3.5" /> View Resume
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit3 className="h-4 w-4 text-primary" /> Edit Your Profile</DialogTitle>
            <DialogDescription>Update your public profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ep-name">Full Name</Label>
              <Input id="ep-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-bio">Bio</Label>
              <Textarea id="ep-bio" placeholder={role === "recruiter" ? "Tell candidates about yourself..." : role === "admin" ? "Describe your administrative role..." : "Tell recruiters about yourself..."} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ep-location">Location</Label>
                <Input id="ep-location" placeholder="e.g. India" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-experience">{role === "recruiter" ? "Experience" : "Education / Experience"}</Label>
                <Input id="ep-experience" placeholder={role === "recruiter" ? "e.g. 5 years" : "e.g. B.Tech CSE"} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              </div>
            </div>
            {(role === "recruiter" || authUser?.role === "recruiter") && (
              <div className="space-y-1.5">
                <Label htmlFor="ep-company">Company</Label>
                <Input id="ep-company" placeholder="e.g. Google" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="ep-skills">{role === "recruiter" ? "Hiring for (comma separated)" : "Skills (comma separated)"}</Label>
              <Input id="ep-skills" placeholder="React, Node.js, Python" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </div>

            {/* Resume File Upload section */}
            <div className="border-t border-border/30 pt-4 mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><UploadCloud className="h-3 w-3" /> Resume Document</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> Resume (PDF)</Label>
                  {form.resume && (
                    <div className="p-2 mb-2 rounded border border-border/50 bg-secondary/30 flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="truncate flex-1">Resume attached</span>
                      <a href={getUploadUrl(form.resume)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs whitespace-nowrap">View</a>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    id="resume-upload"
                    onChange={(e) => handleFileUpload(e, 'resume')}
                    disabled={uploadingResume}
                  />
                  <Label htmlFor="resume-upload" className="cursor-pointer block">
                    <div className="flex items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium transition-colors">
                      {uploadingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                      {form.resume ? "Replace Resume" : "Upload Resume"}
                    </div>
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setEditOpen(false)}><X className="h-4 w-4" /> Cancel</Button>
              <Button className="flex-1 gradient-primary border-0 text-primary-foreground gap-2" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
