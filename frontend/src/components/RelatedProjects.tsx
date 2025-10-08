import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProjectCard from "./ProjectCard";
import { useNavigate } from "react-router-dom"; // navigation
import { Button } from "@/components/ui/button";

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
  category: string; // added category prop
}

const RelatedProjects = ({ projects, category }: RelatedProjectsProps) => {
  const navigate = useNavigate();

  if (projects.length === 0) return null;

  const handleProjectClick = (id: string) => {
    navigate(`/project/${id}`);
    window.scrollTo(0, 0);
  };

  const handleDiscoverMore = () => {
    navigate(`/projects/category/${category}`); // route to all projects in this category
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recommended Projects</h2>
        <Button size="sm" onClick={handleDiscoverMore}>
          Discover More
        </Button>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {projects.map((project) => (
            <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3">
              <div
                onClick={() => handleProjectClick(project.id)}
                className="cursor-pointer"
              >
                <ProjectCard {...project} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrow Buttons */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 z-10">
          <CarouselPrevious>
            <Button size="icon" className="p-2">{"<"}</Button>
          </CarouselPrevious>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10">
          <CarouselNext>
            <Button size="icon" className="p-2">{">"}</Button>
          </CarouselNext>
        </div>
      </Carousel>
    </div>
  );
};

export default RelatedProjects;
