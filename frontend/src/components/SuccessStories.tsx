import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const successStories = [
  {
    title: "Smart Home Garden",
    creator: "GreenTech Labs",
    raised: 285000,
    goal: 50000,
    category: "Technology",
    impact: "Revolutionized urban gardening for 5,000+ homes",
  },
  {
    title: "Indie Game: Crystal Quest",
    creator: "Pixel Studios",
    raised: 450000,
    goal: 100000,
    category: "Games",
    impact: "Became #1 indie game with 100K+ downloads",
  },
  {
    title: "Eco-Friendly Water Bottle",
    creator: "PureLife Co",
    raised: 180000,
    goal: 30000,
    category: "Design",
    impact: "Removed 50,000 plastic bottles from circulation",
  },
  {
    title: "Documentary: Ocean Voices",
    creator: "Blue Planet Films",
    raised: 320000,
    goal: 150000,
    category: "Film",
    impact: "Won 3 film festival awards",
  },
];

const SuccessStories = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Success</span> Stories
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real projects that exceeded their goals and made a lasting impact
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {successStories.map((story, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover:shadow-lg transition-smooth">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary">{story.category}</Badge>
                      <div className="flex items-center gap-1 text-success text-sm font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        {Math.round((story.raised / story.goal) * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg mb-1">{story.title}</h3>
                      <p className="text-sm text-muted-foreground">by {story.creator}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Raised</span>
                        <span className="font-bold text-success">${story.raised.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Goal</span>
                        <span className="font-medium">${story.goal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground italic">"{story.impact}"</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default SuccessStories;
