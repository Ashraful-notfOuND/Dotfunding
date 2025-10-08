import { useParams, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { allProjects } from "@/data/allProjects";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const CategoryPage = () => {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = 9;
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Filter projects by category first
  const categoryProjects = allProjects.filter((p) => p.category === category);

  // Filter by search query within category
  const filteredProjects = categoryProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.creator.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-3xl font-bold mb-6 capitalize">{category} Projects</h1>

        {/* Search Box */}
        <div className="mb-6 flex items-center gap-3">
          <Input
            type="text"
            placeholder={`Search projects in ${category}...`}
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

        {paginatedProjects.length > 0 ? (
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
          <p className="text-muted-foreground">No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
