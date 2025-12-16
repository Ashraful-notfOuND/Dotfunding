import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import CategoryNav from "@/components/CategoryNav";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, Film, Gamepad2, Lightbulb, Music, Cpu, Grid3x3 } from "lucide-react";
import FilterPanel from "@/components/FilterPanel";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("popularity");
  const [fundingGoalRange, setFundingGoalRange] = useState([5000]);

  // backend projects
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3002/api/projects");
        if (!res.ok) throw new Error(`Failed to fetch projects (${res.status})`);
        const data = await res.json();
        setProjects(data.projects || data);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Helper function to check if a project is live (deadline hasn't passed)
  const isProjectLive = (deadline: string): boolean => {
    if (!deadline) return true; // If no deadline, consider it live
    const now = new Date();
    const d = new Date(deadline);
    return d.getTime() > now.getTime();
  };

  const normalizedProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Filter out past projects - only show live/running projects
        const deadline = p.fundingDeadline || p.funding_deadline;
        return isProjectLive(deadline);
      })
      .map((p) => ({
        ...p,
        image: p.image || p.image_urls || "",
        images: p.images || (p.image_urls ? [p.image_urls] : []),
        status: p.status || "active",
        fundingCurrent: p.fundingCurrent || 0,
        fundingGoal: p.fundingGoal || 0,
        backers: p.backers || 0,
        daysLeft: p.daysLeft || 0,
      }));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let filtered = [...normalizedProjects];

    // ✅ Category-based filtering
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
            b.fundingCurrent / b.fundingGoal -
            a.fundingCurrent / a.fundingGoal
        );
        break;
      case "end-date":
        filtered.sort((a, b) => a.daysLeft - b.daysLeft);
        break;
      case "newest":
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      default:
        filtered.sort((a, b) => (b.backers || 0) - (a.backers || 0));
        break;
    }

    setCurrentPage(1);
    return filtered;
  }, [
    normalizedProjects,
    selectedCategory,
    selectedSubCategories,
    selectedFilters,
    sortOption,
    fundingGoalRange,
  ]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading projects...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ✅ Updated CategoryNav with backend categories */}
   <CategoryNav
  categories={[
    { name: "All", icon: Grid3x3 },
    { name: "Technology", icon: Cpu },
    { name: "Art", icon: Palette },
    { name: "Games", icon: Gamepad2 },
    { name: "Design", icon: Lightbulb },
    { name: "Film & Video", icon: Film },
    { name: "Music", icon: Music },
    { name: "Publishing", icon: Grid3x3 },
    { name: "Food & Craft", icon: Grid3x3 },
  ]}
  selectedCategory={selectedCategory}
  onCategoryChange={(cat) => {
    setSelectedCategory(cat);        // change category
    setSelectedSubCategories([]);    // reset subcategories
    setSelectedFilters([]);          // reset sidebar filters
    setSortOption("popularity");     // optional: reset sort
  }}
/>


      {/* Main Section */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
  <div className="sticky top-24">
    <FilterPanel
      selectedFilters={selectedFilters}
      onFilterToggle={(filter) =>
        setSelectedFilters((prev) =>
          prev.includes(filter)
            ? prev.filter((f) => f !== filter)
            : [...prev, filter]
        )
      }
      sortOption={sortOption}
      onSortChange={setSortOption}
      fundingGoalRange={fundingGoalRange}
      onFundingGoalChange={setFundingGoalRange}
      selectedSubCategories={selectedSubCategories}
      onSubCategoryToggle={(subCategory) =>
        setSelectedSubCategories((prev) =>
          prev.includes(subCategory)
            ? prev.filter((s) => s !== subCategory)
            : [...prev, subCategory]
        )
      }
    />
  </div>
</aside>

{/* Mobile Filters */}
{isMobileFiltersOpen && (
  <div className="lg:hidden mb-6 animate-fade-in">
    <FilterPanel
      selectedFilters={selectedFilters}
      onFilterToggle={(filter) =>
        setSelectedFilters((prev) =>
          prev.includes(filter)
            ? prev.filter((f) => f !== filter)
            : [...prev, filter]
        )
      }
      sortOption={sortOption}
      onSortChange={setSortOption}
      fundingGoalRange={fundingGoalRange}
      onFundingGoalChange={setFundingGoalRange}
      selectedSubCategories={selectedSubCategories}
      onSubCategoryToggle={(subCategory) =>
        setSelectedSubCategories((prev) =>
          prev.includes(subCategory)
            ? prev.filter((s) => s !== subCategory)
            : [...prev, subCategory]
        )
      }
    />
  </div>
)}


        {/* Projects */}
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           <AnimatePresence mode="wait">
                {currentProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.07 }}
                  >
                    <ProjectCard {...project} />
                  </motion.div>
                ))}
              </AnimatePresence>
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                No projects found in this category.
              </p>
              <Button variant="outline" onClick={() => setSelectedCategory("All")}>
                View All Projects
              </Button>
            </div>
          )}

          {/* Pagination */}
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

      <Footer />
    </div>
  );
};

export default Explore;
