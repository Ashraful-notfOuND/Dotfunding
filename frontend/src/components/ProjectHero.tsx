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
  status: "just-launched" | "trending" | "funded" | "nearly-funded" | "active"; // Updated type
}

const ProjectHero = ({ title, creator, tagline, images, videoUrl, status }: ProjectHeroProps) => {
  const statusConfig = {
    "just-launched": { label: "Just Launched", variant: "default" as const },
    "trending": { label: "Trending", variant: "secondary" as const },
    "funded": { label: "Funded", variant: "default" as const },
    "nearly-funded": { label: "Nearly Funded", variant: "warning" as const }, // Added
    "active": { label: "Active", variant: "outline" as const }, // Added
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Badge className="mb-3" variant={statusConfig[status].variant}>
            {statusConfig[status].label}
          </Badge>
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-lg text-muted-foreground mb-2">{tagline}</p>
          <button className="text-primary hover:underline font-medium">
            by {creator}
          </button>
        </div>
      </div>

      {videoUrl ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg">
          <iframe
            src={videoUrl}
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
