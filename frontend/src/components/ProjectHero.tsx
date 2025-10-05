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
  status: "just-launched" | "trending" | "funded";
}

const ProjectHero = ({ title, creator, tagline, images, status }: ProjectHeroProps) => {
  const statusConfig = {
    "just-launched": { label: "Just Launched", variant: "default" as const },
    "trending": { label: "Trending", variant: "secondary" as const },
    "funded": { label: "Funded", variant: "default" as const },
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
    </div>
  );
};

export default ProjectHero;
