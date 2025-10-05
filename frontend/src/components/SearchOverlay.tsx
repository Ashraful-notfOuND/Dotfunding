import { useState, useEffect, useRef, useMemo } from "react"; // Added useMemo
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, TrendingUp, Sparkles, Users, Target, Film, Music, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useDebounce from "@/hooks/useDebounce";
import { allProjects } from "@/data/mockProjects"; // Import allProjects

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingSearches = ["Tech", "Art", "Games", "Design", "Film", "Music"];

const popularCategories = [
  { name: "Technology", icon: Sparkles, link: "/explore?category=technology" },
  { name: "Art", icon: Palette, link: "/explore?category=art" },
  { name: "Games", icon: Target, link: "/explore?category=games" },
  { name: "Design", icon: Users, link: "/explore?category=design" },
  { name: "Film & Video", icon: Film, link: "/explore?category=film" },
  { name: "Music", icon: Music, link: "/explore?category=music" },
];

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const inputRef = useRef<HTMLInputElement>(null);

              useEffect(() => {
                if (isOpen) {
                  // Focus the input when the overlay opens
                  inputRef.current?.focus();
                  // Disable body scroll
                  document.body.style.overflow = "hidden";
                } else {
                  // Enable body scroll
                  document.body.style.overflow = "unset";
                  setSearchTerm(""); // Clear search term when closing
                }
                return () => {
                  document.body.style.overflow = "unset"; // Ensure scroll is re-enabled on unmount
                };
              }, [isOpen]);  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
    return allProjects.filter(project =>
      project.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      project.creator.toLowerCase().includes(lowerCaseSearchTerm) ||
      project.category.toLowerCase().includes(lowerCaseSearchTerm) ||
      project.subCategory.toLowerCase().includes(lowerCaseSearchTerm)
    ).slice(0, 5); // Limit to 5 results for brevity
  }, [debouncedSearchTerm]);

  const overlayVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
  };

  if (!isOpen && !document.body.style.overflow) return null; // Render null when closed to prevent flicker

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] bg-background/90 flex flex-col items-center p-4 md:p-8"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose} // Close on background click
        >
          <motion.div
            className="w-full max-w-3xl bg-card rounded-lg shadow-xl p-6 md:p-8 space-y-6"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()} // Prevent clicks inside from closing overlay
          >
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search for projects, creators, categories..."
                className="w-full pl-12 pr-12 py-3 text-lg rounded-full border-2 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 h-9 w-9 rounded-full"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Trending Searches */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Trending Searches</h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((tag) => (
                  <Button key={tag} variant="outline" size="sm" onClick={() => setSearchTerm(tag)}>
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Popular Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {popularCategories.map((category) => (
                  <Link key={category.name} to={category.link} onClick={onClose}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live Results / Suggestions */}
            {debouncedSearchTerm && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Results for "{debouncedSearchTerm}"</h3>
                {filteredResults.length > 0 ? (
                  <div className="space-y-2">
                    {filteredResults.map(project => (
                      <Link key={project.id} to={`/project/${project.id}`} onClick={onClose}>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                          <img src={project.image} alt={project.title} className="w-10 h-10 object-cover rounded-md" />
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-sm text-muted-foreground">by {project.creator} in {project.category}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 text-muted-foreground">
                    <p>No results found for "{debouncedSearchTerm}".</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
