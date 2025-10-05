import { Skeleton } from "@/components/ui/skeleton";

const ProjectCardSkeleton = () => {
  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-smooth border border-border animate-fade-in relative">
      {/* Image Skeleton */}
      <div className="relative aspect-video overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Content Skeletons */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />

        {/* Funding Progress Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Stats Skeletons */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};

export default ProjectCardSkeleton;
