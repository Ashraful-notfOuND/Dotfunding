import { useParams, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ProjectCard from "@/components/ProjectCard";
import ProjectCardSkeleton from "@/components/ProjectCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const CategoryPage = () => {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 9;
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const backend = (import.meta.env as any).VITE_BACKEND_URL || "http://localhost:5000";
        const res = await fetch(`${backend}/api/projects`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch projects from server");
        }
        
        const body = await res.json();
        setProjects(body.projects || []);
      } catch (e) {
        console.error("Error fetching projects:", e);
        setError("Failed to load projects. Please try again later.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects by category (case-insensitive and decode URL)
  const decodedCategory = category ? decodeURIComponent(category) : "";
  const categoryProjects = projects.filter(
    (p) => p.category?.toLowerCase() === decodedCategory?.toLowerCase()
  );

  // Filter by search query within category
  const filteredProjects = categoryProjects.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.creator?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
       <Navbar hideSearch />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">{decodedCategory} Projects</h1>

        {/* Search Box */}
        <div className="mb-6 flex items-center gap-3">
          <Input
            type="text"
            placeholder={`Search projects in ${decodedCategory}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-300 shadow-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <Button
            onClick={() => setSearchQuery("")}
            variant="outline"
            size="sm"
          >
            Clear
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        ) : paginatedProjects.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project) => (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <ProjectCard {...project} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                size="sm"
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    onClick={() => goToPage(pageNum)}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                size="sm"
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No projects found in {decodedCategory}
              {searchQuery && ` matching "${searchQuery}"`}.
            </p>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
