import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Users, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/types";

const typeColors: Record<string, string> = {
  "Full-time": "bg-primary/10 text-primary border-primary/20",
  "Part-time": "bg-warning/10 text-warning border-warning/20",
  "Contract": "bg-accent/10 text-accent border-accent/20",
  "Internship": "bg-info/10 text-info border-info/20",
  "Remote": "bg-success/10 text-success border-success/20",
};

export function JobCard({ job }: { job: Job }) {
  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-secondary-foreground">
                {job.company.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.postedAt}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job.applicants} applicants</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge className={typeColors[job.type] || ""} variant="outline">{job.type}</Badge>
            {job.skills.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
          </div>
          <p className="mt-2 text-sm font-medium text-primary">{job.salary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
