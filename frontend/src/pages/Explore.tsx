import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import CategoryNav from "@/components/CategoryNav";
import FilterPanel from "@/components/FilterPanel";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
//import { allProjects} from "@/data/mockProjects"; // or your mock data path
import { allProjects as staticProjects } from "@/data/allProjects";

// If not using external mock data, your allProjects can stay here

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

  // Projects state: prefer backend-fetched projects, fall back to static data
  const [projects, setProjects] = useState<any[]>(staticProjects as any[]);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      try {
        const backend = (import.meta.env as any).VITE_BACKEND_URL || "http://localhost:5000";
        const res = await fetch(`${backend}/api/projects`);
        if (!res.ok) {
          console.warn("Explore: failed to fetch projects from backend, using static fallback");
          return;
        }
        const body = await res.json();
        if (!mounted) return;
        const fetched = (body.projects || []) as any[];

        // Map backend shape to the shape Explore expects (best-effort)
        const mapped = fetched.map((p) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline || "",
          creator: p.creator || p.creator || "",
          image: p.image || p.imageUrl || "",
          fundingGoal: p.fundingGoal || p.funding_goal || 0,
          fundingCurrent: p.fundingCurrent || p.funding_current || 0,
          backers: p.backers || 0,
          daysLeft: typeof p.daysLeft === "number" ? p.daysLeft : p.days_left || 0,
          category: p.category || "All",
          subCategory: p.subCategory || p.sub_category || "",
          status: p.status || "active",
          location: p.location || "",
          staffPick: p.staffPick || false,
          description: p.description || "",
          images: p.images || (p.image ? [p.image] : []),
          createdDate: p.createdDate ? new Date(p.createdDate) : undefined,
        }));

        setProjects(mapped.length ? mapped : staticProjects as any[]);
      } catch (e) {
        console.warn("Explore: error fetching projects, using static fallback", e);
        setProjects(staticProjects as any[]);
      }
    };

    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of cards per page

  const filteredProjects = useMemo(() => {
  let filtered = [...projects];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedSubCategories.includes(p.subCategory)
      );
    }

    filtered = filtered.filter((p) => p.fundingGoal <= fundingGoalRange[0]);

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
        filtered.sort(
          (a, b) =>
            b.fundingCurrent / b.fundingGoal - a.fundingCurrent / a.fundingGoal
        );
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

    // Reset to first page if filters change
    setCurrentPage(1);
    return filtered;
  }, [
    selectedCategory,
    selectedSubCategories,
    selectedFilters,
    sortOption,
    fundingGoalRange,
  ]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFiltersOpen((o) => !o)}
              >
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
                Showing {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "project" : "projects"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {currentProjects.map((project) => (
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
                <p className="text-lg text-muted-foreground mb-4">
                  No projects found.
                </p>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}

            {/*PAGINATION COMPONENT */}
            {filteredProjects.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
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
