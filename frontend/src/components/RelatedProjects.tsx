import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProjectCard from "./ProjectCard";

interface Project {
  id: string;
  title: string;
  creator: string;
  image: string;
  fundingGoal: number;
  fundingCurrent: number;
  backers: number;
  daysLeft: number;
  category: string;
}

interface RelatedProjectsProps {
  projects: Project[];
}

const RelatedProjects = ({ projects }: RelatedProjectsProps) => {
  if (projects.length === 0) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Recommended Projects</h2>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {projects.map((project) => (
            <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3">
              <ProjectCard {...project} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RelatedProjects;
