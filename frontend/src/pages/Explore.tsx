import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import CategoryNav from "@/components/CategoryNav";
import SubCategoryNav from "@/components/SubCategoryNav";
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

// Mock data
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
  },
];

const featuredProject = {
  id: "featured-1",
  title: "Revolutionary Smart Watch with Health Monitoring",
  creator: "TechInnovate",
  image: projectTech,
  fundingGoal: 50000,
  fundingCurrent: 42350,
  daysLeft: 12,
  category: "Technology",
  description: "A next-generation smartwatch featuring advanced health monitoring capabilities including blood pressure, ECG, and sleep analysis.",
};

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "All"
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(
    searchParams.get("subCategory") || "All"
  );
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    searchParams.get("filters")?.split(",") || []
  );
  const [filteredProjects, setFilteredProjects] = useState(allProjects);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Update URL params when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (selectedSubCategory !== "All") params.subCategory = selectedSubCategory;
    if (selectedFilters.length > 0) params.filters = selectedFilters.join(",");
    setSearchParams(params);
  }, [selectedCategory, selectedSubCategory, selectedFilters, setSearchParams]);

  // Filter projects based on selections
  useEffect(() => {
    let filtered = allProjects;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubCategory !== "All") {
      filtered = filtered.filter((p) => p.subCategory === selectedSubCategory);
    }

    // Filter by status/special filters
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

    setFilteredProjects(filtered);
  }, [selectedCategory, selectedSubCategory, selectedFilters]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory("All");
  };

  const handleSubCategoryChange = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
  };

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Category Navigation */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - SubCategories (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <SubCategoryNav
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              onSubCategoryChange={handleSubCategoryChange}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {selectedCategory === "All" ? "All Projects" : selectedCategory}
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              >
                {isMobileFiltersOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
                <span className="ml-2">Filters</span>
              </Button>
            </div>

            {/* Mobile Filters Panel */}
            {isMobileFiltersOpen && (
              <div className="lg:hidden mb-6 animate-fade-in">
                <SubCategoryNav
                  selectedCategory={selectedCategory}
                  selectedSubCategory={selectedSubCategory}
                  onSubCategoryChange={handleSubCategoryChange}
                />
                <div className="mt-4">
                  <FilterPanel
                    selectedFilters={selectedFilters}
                    onFilterToggle={handleFilterToggle}
                  />
                </div>
              </div>
            )}

            {/* Filter Panel (Desktop) */}
            <div className="hidden lg:block mb-6">
              <FilterPanel
                selectedFilters={selectedFilters}
                onFilterToggle={handleFilterToggle}
              />
            </div>

            {/* Projects Count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}{" "}
                found
              </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No projects found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedSubCategory("All");
                    setSelectedFilters([]);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </main>

          {/* Right Sidebar - Featured Project (Desktop) */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FeaturedProjectCard project={featuredProject} />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Explore;
