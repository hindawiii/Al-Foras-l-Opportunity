import { Skeleton } from "@/components/ui/skeleton";

export interface OpportunitySkeletonProps {
  count?: number;
  viewMode?: "card" | "deck" | "list";
}

export const OpportunitySkeleton = ({ count = 3, viewMode = "card" }: OpportunitySkeletonProps) => {
  if (viewMode === "deck") {
    return (
      <div className="w-full max-w-sm mx-auto h-[480px] p-4 bg-card/70 border border-primary/20 rounded-3xl backdrop-blur-xl shadow-luxe flex flex-col justify-between animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 rounded-full bg-primary/15" />
            <Skeleton className="h-6 w-16 rounded-full bg-muted/60" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl bg-muted/60" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4 rounded bg-muted/80" />
              <Skeleton className="h-3 w-1/2 rounded bg-muted/50" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3.5 w-full rounded bg-muted/40" />
            <Skeleton className="h-3.5 w-5/6 rounded bg-muted/40" />
            <Skeleton className="h-3.5 w-4/6 rounded bg-muted/40" />
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 rounded-xl bg-muted/40" />
            <Skeleton className="h-8 rounded-xl bg-muted/40" />
          </div>
          <div className="flex justify-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full bg-muted/50" />
            <Skeleton className="w-14 h-14 rounded-full bg-primary/20" />
            <Skeleton className="w-14 h-14 rounded-full bg-muted/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-card/75 border border-border/70 backdrop-blur-md space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Skeleton className="w-10 h-10 rounded-xl bg-muted/60 shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-4 w-2/3 rounded bg-muted/80" />
                <Skeleton className="h-3 w-1/3 rounded bg-muted/50" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full bg-primary/15 shrink-0" />
          </div>

          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-full rounded bg-muted/40" />
            <Skeleton className="h-3 w-4/5 rounded bg-muted/40" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-md bg-muted/40" />
              <Skeleton className="h-5 w-20 rounded-md bg-muted/40" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl bg-primary/20" />
          </div>
        </div>
      ))}
    </div>
  );
};
