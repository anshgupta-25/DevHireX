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
  FileText,
  Edit3,
  Save,
  X,
  Loader2,
  ArrowLeft,
  Shield,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for editing
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    experience: "",
    skills: "",
    company: "",
  });

  const isOwnProfile = !id || id === authUser?.id;

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
        });
      } catch {
        toast({
          title: "Error",
          description: "Could not load profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwnProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
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
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Profile not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const roleColor =
    profile.role === "admin"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : profile.role === "recruiter"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-green-100 text-green-700 border-green-200";

  const roleGradient =
    profile.role === "admin"
      ? "from-purple-500 to-purple-700"
      : profile.role === "recruiter"
      ? "from-blue-500 to-blue-700"
      : "from-emerald-500 to-emerald-700";

  return (
    <div className="container py-8 max-w-3xl">
      {/* Back button for viewing other profiles */}
      {!isOwnProfile && (
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      )}

      {/* Hero Card */}
      <Card className="border-border/50 overflow-hidden mb-6">
        {/* Gradient header */}
        <div className={`h-28 bg-gradient-to-r ${roleGradient} relative`}>
          <div className="absolute -bottom-10 left-8">
            <div className="h-20 w-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-full w-full rounded-xl object-cover" />
              ) : (
                <span className={`text-3xl font-black bg-gradient-to-br ${roleGradient} bg-clip-text text-transparent`}>
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        <CardContent className="pt-14 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className={`capitalize ${roleColor}`}>
                  {profile.role}
                </Badge>
                {profile.company && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {profile.company}
                  </span>
                )}
              </div>
            </div>
            {isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setEditOpen(true)}
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            ) : (
              <Button
                size="sm"
                className="gap-2 gradient-primary border-0 text-primary-foreground"
                onClick={() => navigate(`/messages?contact=${profile._id}`)}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Send Message
              </Button>
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-5">
            {profile.email && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> {profile.email}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {profile.location}
              </div>
            )}
            {profile.experience && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {profile.experience}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <Card className="border-border/50 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Skills & Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="px-3 py-1 text-xs font-medium"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" /> Account Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">{profile.role}</span>
            </div>
            {profile.company && (
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Company</span>
                <span className="font-medium">{profile.company}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            {profile.createdAt && (
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">{new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
            <DialogDescription>Update your public profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ep-name">Full Name</Label>
              <Input
                id="ep-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-bio">Bio</Label>
              <Textarea
                id="ep-bio"
                placeholder="Tell us about yourself..."
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ep-location">Location</Label>
                <Input
                  id="ep-location"
                  placeholder="e.g. India"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-experience">Experience</Label>
                <Input
                  id="ep-experience"
                  placeholder="e.g. 2 years"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
            </div>
            {(profile?.role === "recruiter" || authUser?.role === "recruiter") && (
              <div className="space-y-1.5">
                <Label htmlFor="ep-company">Company</Label>
                <Input
                  id="ep-company"
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="ep-skills">Skills</Label>
              <Input
                id="ep-skills"
                placeholder="React, Node.js, Python (comma separated)"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setEditOpen(false)}>
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button
                className="flex-1 gradient-primary border-0 text-primary-foreground gap-2"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
