import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import CategoryNav from "@/components/CategoryNav";
import FilterPanel from "@/components/FilterPanel";
import FeaturedProjectCard from "@/components/FeaturedProjectCard";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import projectTech from "@/assets/project-tech.jpg";
import projectArt from "@/assets/project-art.jpg";
import projectGame from "@/assets/project-game.jpg";
import projectDesign from "@/assets/project-design.jpg";
import projectFilm from "@/assets/project-film.jpg";
import projectMusic from "@/assets/project-music.jpg";
import { AnimatePresence, motion } from "framer-motion";
import { allProjects, featuredProject } from "@/data/mockProjects"; // Import from centralized mock data

// Mock data - expanded for better filtering/sorting
const allProjects = [
  {
    id: "1",
    title: "Revolutionary Smart Watch with Health Monitoring",
    creator: "TechInnovate",
    image: projectTech,
    fundingGoal: 50000,
    fundingCurrent: 42350,
    daysLeft: 12,
    category: "Technology",
    subCategory: "Wearables",
    status: "trending",
    location: "USA",
    staffPick: true,
    backers: 847,
  },
  {
    id: "2",
    title: "Art Book: Journey Through Modern Abstract Painting",
    creator: "Sarah Mitchell",
    image: projectArt,
    fundingGoal: 15000,
    fundingCurrent: 18200,
    daysLeft: 8,
    category: "Art",
    subCategory: "Books",
    status: "nearly-funded",
    location: "UK",
    staffPick: true,
    backers: 350,
  },
  {
    id: "3",
    title: "Epic Fantasy Board Game: Dragon's Quest",
    creator: "GameCraft Studios",
    image: projectGame,
    fundingGoal: 35000,
    fundingCurrent: 28500,
    daysLeft: 15,
    category: "Games",
    subCategory: "Board Games",
    status: "trending",
    location: "Canada",
    staffPick: false,
    backers: 1205,
  },
  {
    id: "4",
    title: "Sustainable Bamboo Home Furniture Collection",
    creator: "EcoDesign Co.",
    image: projectDesign,
    fundingGoal: 25000,
    fundingCurrent: 12400,
    daysLeft: 20,
    category: "Design",
    subCategory: "Home & Living",
    status: "active",
    location: "USA",
    staffPick: false,
    backers: 423,
  },
  {
    id: "5",
    title: "Independent Film: Stories from the City",
    creator: "Urban Films",
    image: projectFilm,
    fundingGoal: 45000,
    fundingCurrent: 31200,
    daysLeft: 18,
    category: "Film",
    subCategory: "Documentary",
    status: "active",
    location: "USA",
    staffPick: true,
    backers: 967,
  },
  {
    id: "6",
    title: "Album Recording: Jazz Fusion Experience",
    creator: "The Groove Collective",
    image: projectMusic,
    fundingGoal: 20000,
    fundingCurrent: 8900,
    daysLeft: 25,
    category: "Music",
    subCategory: "Albums",
    status: "just-launched",
    location: "USA",
    staffPick: false,
    backers: 150,
  },
  {
    id: "7",
    title: "AI-Powered Home Security System",
    creator: "SecureHome",
    image: projectTech,
    fundingGoal: 75000,
    fundingCurrent: 3200,
    daysLeft: 30,
    category: "Technology",
    subCategory: "Smart Home",
    status: "just-launched",
    location: "USA",
    staffPick: false,
    backers: 50,
  },
  {
    id: "8",
    title: "Contemporary Sculpture Exhibition",
    creator: "Gallery Modern",
    image: projectArt,
    fundingGoal: 30000,
    fundingCurrent: 28900,
    daysLeft: 5,
    category: "Art",
    subCategory: "Sculpture",
    status: "nearly-funded",
    location: "France",
    staffPick: true,
    backers: 700,
  },
  {
    id: "9",
    title: "RPG Video Game: Lost Kingdoms",
    creator: "Indie Game Studios",
    image: projectGame,
    fundingGoal: 100000,
    fundingCurrent: 65000,
    daysLeft: 14,
    category: "Games",
    subCategory: "Video Games",
    status: "trending",
    location: "Japan",
    staffPick: false,
    backers: 2500,
  },
  {
    id: "10",
    title: "Minimalist Ceramic Dinnerware Set",
    creator: "Clay Artisans",
    image: projectDesign,
    fundingGoal: 15000,
    fundingCurrent: 9200,
    daysLeft: 22,
    category: "Design",
    subCategory: "Tableware",
    status: "active",
    location: "Denmark",
    staffPick: false,
    backers: 300,
  },
  {
    id: "11",
    title: "Animation Short Film: Dream Sequence",
    creator: "Animated Dreams",
    image: projectFilm,
    fundingGoal: 25000,
    fundingCurrent: 18700,
    daysLeft: 10,
    category: "Film",
    subCategory: "Animation",
    status: "trending",
    location: "USA",
    staffPick: true,
    backers: 600,
  },
  {
    id: "12",
    title: "Electronic Music Festival Documentary",
    creator: "Beat Chronicles",
    image: projectMusic,
    fundingGoal: 40000,
    fundingCurrent: 12300,
    daysLeft: 28,
    category: "Music",
    subCategory: "Events",
    status: "active",
    location: "Germany",
    staffPick: false,
    backers: 200,
  },
];

const featuredProject = allProjects[0];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("popularity");
  const [fundingGoalRange, setFundingGoalRange] = useState([100000]);

  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((p) => selectedSubCategories.includes(p.subCategory));
    }

    filtered = filtered.filter(p => p.fundingGoal <= fundingGoalRange[0]);

    if (selectedFilters.length > 0) {
      filtered = filtered.filter((project) => {
        return selectedFilters.every((filter) => {
          if (filter === "trending") return project.status === "trending";
          if (filter === "just-launched") return project.status === "just-launched";
          if (filter === "nearly-funded") return project.status === "nearly-funded";
          if (filter === "staff-picks") return project.staffPick === true;
          if (filter === "near-you") return project.location === "USA";
          return true;
        });
      });
    }

    switch (sortOption) {
      case "funding":
        filtered.sort((a, b) => (b.fundingCurrent / b.fundingGoal) - (a.fundingCurrent / a.fundingGoal));
        break;
      case "end-date":
        filtered.sort((a, b) => a.daysLeft - b.daysLeft);
        break;
      case "newest":
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case "popularity":
      default:
        filtered.sort((a, b) => (b.backers || 0) - (a.backers || 0));
        break;
    }

    return filtered;
  }, [
    selectedCategory,
    selectedSubCategories,
    selectedFilters,
    sortOption,
    fundingGoalRange,
  ]);

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleSubCategoryToggle = (subCategory: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategory)
        ? prev.filter((s) => s !== subCategory)
        : [...prev, subCategory]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedSubCategories([]);
    setSelectedFilters([]);
    setFundingGoalRange([100000]);
    setSortOption("popularity");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CategoryNav
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => setSelectedCategory(cat)}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel
                selectedFilters={selectedFilters}
                onFilterToggle={handleFilterToggle}
                sortOption={sortOption}
                onSortChange={setSortOption}
                fundingGoalRange={fundingGoalRange}
                onFundingGoalChange={setFundingGoalRange}
                selectedSubCategories={selectedSubCategories}
                onSubCategoryToggle={handleSubCategoryToggle}
              />
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {selectedCategory === "All" ? "All Projects" : selectedCategory}
              </h1>
              <Button variant="outline" size="sm" onClick={() => setIsMobileFiltersOpen(o => !o)}>
                <Menu className="h-4 w-4 mr-2" /> Filters
              </Button>
            </div>

            {isMobileFiltersOpen && (
              <div className="lg:hidden mb-6 animate-fade-in">
                <FilterPanel
                  selectedFilters={selectedFilters}
                  onFilterToggle={handleFilterToggle}
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                  fundingGoalRange={fundingGoalRange}
                  onFundingGoalChange={setFundingGoalRange}
                  selectedSubCategories={selectedSubCategories}
                  onSubCategoryToggle={handleSubCategoryToggle}
                />
              </div>
            )}

            <div className="mb-6 flex justify-between items-center">
              <p className="text-muted-foreground">
                Showing {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProjectCard {...project} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">No projects found.</p>
                <Button variant="outline" onClick={clearAllFilters}>Clear All Filters</Button>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Explore;
