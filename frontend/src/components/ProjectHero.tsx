import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";

interface ProjectHeroProps {
  title: string;
  creator: string;
  tagline: string;
  images: string[];
  videoUrl?: string; // Added videoUrl prop
  status: "just-launched" | "trending" | "funded" | "nearly-funded" | "active" | "ended-success" | "ended-failed";
}

const ProjectHero = ({ title, creator, tagline, images, videoUrl, status }: ProjectHeroProps) => {
  // Normalize common video URLs (YouTube watch, youtu.be short links, Vimeo) into embed URLs
  const normalizeVideoUrl = (url?: string) => {
    if (!url) return null;
    try {
      const u = url.trim();
      // already an embed URL
      if (u.includes("/embed/")) return u;

      // YouTube long watch URL
      if (u.includes("youtube.com/watch")) {
        const params = new URL(u).searchParams;
        const v = params.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      }

      // youtu.be short link
      if (u.includes("youtu.be/")) {
        const parts = u.split("youtu.be/");
        if (parts[1]) {
          const id = parts[1].split(/[?&]/)[0];
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      // Vimeo (convert to player URL)
      if (u.includes("vimeo.com/")) {
        const parts = u.split("vimeo.com/");
        if (parts[1]) {
          const id = parts[1].split(/[?&]/)[0];
          return `https://player.vimeo.com/video/${id}`;
        }
      }

      // fallback: return original (may still work)
      return u;
    } catch (e) {
      return url;
    }
  };

  const embedUrl = normalizeVideoUrl(videoUrl);
  const statusConfig = {
    "just-launched": { label: "Just Launched", variant: "default" as const },
    "trending": { label: "Trending", variant: "secondary" as const },
    "funded": { label: "Funded", variant: "default" as const },
    "nearly-funded": { label: "Nearly Funded", variant: "warning" as const },
    "active": { label: "Active", variant: "outline" as const },
    "ended-success": { label: "Successfully Funded", variant: "default" as const, className: "bg-green-600 hover:bg-green-700" },
    "ended-failed": { label: "Campaign Ended", variant: "secondary" as const },
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Badge className={`mb-3 ${statusConfig[status].className || ''}`}>
            {statusConfig[status].label}
          </Badge>
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-lg text-muted-foreground mb-2">{tagline}</p>
          <button className="text-primary hover:underline font-medium">
            by {creator}
          </button>
        </div>
      </div>

      {embedUrl ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg">
          <iframe
            src={embedUrl as string}
            title="Project Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      ) : (
        <Carousel
          className="w-full"
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={image}
                    alt={`${title} - Image ${index + 1}`}
                    className="w-full h-auto object-cover hover-scale"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
};

export default ProjectHero;
