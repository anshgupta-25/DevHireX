import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
  onJobCreated: () => void;
}

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

export default function PostJobModal({ open, onClose, onJobCreated }: PostJobModalProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !company || !location || !salary || !description) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/jobs", {
        title,
        company,
        location,
        type,
        salary,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        description,
      });
      toast({ title: "Job Posted!", description: `"${title}" has been published.` });
      // Reset form
      setTitle(""); setCompany(""); setLocation(""); setType("Full-time");
      setSalary(""); setSkills(""); setDescription("");
      onJobCreated();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to post job.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border/50 bg-card p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Post a New Job</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title *</Label>
            <Input id="job-title" placeholder="e.g. Frontend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-company">Company *</Label>
              <Input id="job-company" placeholder="e.g. NovaTech" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-location">Location *</Label>
              <Input id="job-location" placeholder="e.g. San Francisco, CA" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-salary">Salary *</Label>
              <Input id="job-salary" placeholder="e.g. $120k - $160k" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-skills">Skills (comma separated)</Label>
            <Input id="job-skills" placeholder="e.g. React, TypeScript, Node.js" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Description *</Label>
            <Textarea id="job-description" placeholder="Describe the role, responsibilities, and requirements..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gradient-primary border-0 text-primary-foreground" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Posting...</> : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
