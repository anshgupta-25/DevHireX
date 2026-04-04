import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Clock, Users, DollarSign, Briefcase, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { Job } from "@/lib/types";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/jobs/${id}`);
        setJob(res.data);
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post("/api/applications", { jobId: id });
      setApplied(true);
      toast({ title: "Application Submitted!", description: `You applied for ${job?.title}` });
    } catch (error: any) {
      toast({
        title: "Application Failed",
        description: error.response?.data?.message || "Could not submit application.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold">Job not found</h2>
        <Link to="/jobs"><Button variant="outline" className="mt-4">Back to Jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Link>

      <Card className="border-border/50">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl font-bold">
              {job.company.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: MapPin, label: job.location },
              { icon: Briefcase, label: job.type },
              { icon: DollarSign, label: job.salary },
              { icon: Users, label: `${job.applicants} applicants` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-sm">
                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">About the Role</h2>
            <p className="text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            {user?.role === "student" ? (
              applied ? (
                <Button disabled className="gap-2">
                  <CheckCircle className="h-4 w-4" /> Applied
                </Button>
              ) : (
                <Button className="gap-2 gradient-primary border-0 text-primary-foreground" onClick={handleApply} disabled={applying}>
                  {applying ? "Applying..." : "Apply Now"}
                </Button>
              )
            ) : !user ? (
              <Link to="/login">
                <Button className="gradient-primary border-0 text-primary-foreground">Sign in to Apply</Button>
              </Link>
            ) : null}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Posted {job.postedAt}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
