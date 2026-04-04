import React from "react";
import { Check, X, Circle } from "lucide-react";

export type ApplicationStatus = "Applied" | "Shortlisted" | "Interview" | "Offered" | "Rejected";

const STAGES: ApplicationStatus[] = ["Applied", "Shortlisted", "Interview", "Offered"];

interface StatusTimelineProps {
  currentStatus: ApplicationStatus;
  className?: string;
}

export function StatusTimeline({ currentStatus, className = "" }: StatusTimelineProps) {
  const isRejected = currentStatus === "Rejected";
  
  // Find the index of the current stage if it's in the STAGES list
  // If rejected, we might need more context, but for now we'll assume they were at 'Applied'
  // Or we could pass the last valid status. Let's just default to 0 if rejected for simplicity,
  // or handle "Rejected" as a special overlay.
  const currentIndex = STAGES.indexOf(currentStatus as any);

  return (
    <div className={`w-full py-8 ${className}`}>
      <div className="relative flex justify-between items-center px-4">
        {/* Connection Lines Container */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 z-0 rounded-full" />
        
        {/* Progress Fill Line */}
        {!isRejected && currentIndex >= 0 && (
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-700 ease-in-out rounded-full" 
            style={{ 
              width: `${(currentIndex / (STAGES.length - 1)) * 100}%`,
              marginLeft: "4px",
              maxWidth: "calc(100% - 8px)"
            }}
          />
        )}

        {STAGES.map((stage, idx) => {
          const isPast = !isRejected && idx < currentIndex;
          const isCurrent = !isRejected && idx === currentIndex;
          const isFuture = !isRejected && idx > currentIndex;
          const isSpecialOffered = currentStatus === "Offered";
          
          // Special case: if Offered, all stages before are Past
          const finalIsPast = isPast || (isSpecialOffered && idx < STAGES.length - 1);
          const finalIsCurrent = isCurrent || (isSpecialOffered && idx === STAGES.length - 1);

          return (
            <div key={stage} className="relative flex flex-col items-center z-10 group">
              {/* Node Circle */}
              <div className={`
                w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500
                ${finalIsPast ? "bg-primary border-primary text-white shadow-lg" : ""}
                ${finalIsCurrent ? "bg-white border-primary text-primary shadow-xl scale-110" : ""}
                ${isFuture ? "bg-white border-secondary text-muted-foreground" : ""}
                ${isRejected && idx === 0 ? "bg-destructive border-destructive text-white" : ""}
              `}>
                {finalIsPast ? (
                  <Check className="h-5 w-5 animate-in zoom-in-50" />
                ) : (isRejected && idx === 0) ? (
                  <X className="h-5 w-5" />
                ) : (
                  <span className={`text-xs font-bold ${finalIsCurrent ? "text-primary" : "text-muted-foreground"}`}>
                    {idx + 1}
                  </span>
                )}
              </div>

              {/* Stage Label */}
              <div className="absolute top-12 flex flex-col items-center">
                <span className={`text-[11px] font-bold uppercase tracking-wider text-center ${
                  finalIsCurrent ? "text-foreground" : (isRejected && idx === 0) ? "text-destructive" : "text-muted-foreground/70"
                }`}>
                  {isRejected && idx === 0 ? "Application Rejected" : stage}
                </span>
                
                {/* Active Indicator Pulse */}
                {finalIsCurrent && (
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isRejected ? "bg-destructive" : "bg-primary"} animate-pulse`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {isRejected && (
        <div className="mt-14 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-center">
          <p className="text-xs text-destructive font-medium flex items-center justify-center gap-2">
            <X className="h-3 w-3" /> Application was not moved forward for this position.
          </p>
        </div>
      )}
    </div>
  );
}
