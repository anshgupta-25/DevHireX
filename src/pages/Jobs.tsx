import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { JobCard } from "@/components/JobCard";
import api from "@/lib/api";
import type { Job } from "@/lib/types";

const jobTypes = ["All", "Full-time", "Part-time", "Contract", "Internship", "Remote"];
const allSkills = ["React", "TypeScript", "Node.js", "Python", "AWS", "Figma", "Kubernetes", "React Native"];

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/jobs");
        setJobs(res.data);
        setError("");
      } catch (err) {
        setError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch = !search || job.title.toLowerCase().includes(search.toLowerCase()) || job.company.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedType === "All" || job.type === selectedType;
      const matchSkills = selectedSkills.length === 0 || selectedSkills.some((s) => job.skills.includes(s));
      return matchSearch && matchType && matchSkills;
    });
  }, [search, selectedType, selectedSkills, jobs]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Find Your Next Role</h1>
        <p className="mt-2 text-muted-foreground">Discover opportunities at the fastest-growing startups</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Filters sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search jobs..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Job Type
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {jobTypes.map((t) => (
                <Badge
                  key={t}
                  variant={selectedType === t ? "default" : "outline"}
                  className="cursor-pointer transition-all"
                  onClick={() => setSelectedType(t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((s) => (
                <Badge
                  key={s}
                  variant={selectedSkills.includes(s) ? "default" : "outline"}
                  className="cursor-pointer transition-all"
                  onClick={() => toggleSkill(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Job list */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} jobs found</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <h3 className="font-semibold">No jobs found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
