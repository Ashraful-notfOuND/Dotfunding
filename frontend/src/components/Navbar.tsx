import { Link } from "react-router-dom";
import { Search, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import SearchOverlay from "@/components/SearchOverlay"; // Import SearchOverlay

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // New state for search overlay
  const { isAuthenticated, logout } = useAuth();

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xl">D</span>
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DotFunding
            </span>
          </Link>

          {/* Center: Desktop Search Bar (visible only on md and up) */}
          <div className="hidden md:flex flex-grow justify-center mx-4"> {/* flex-grow and mx-4 for centering */}
            <div className="relative w-full max-w-lg"> {/* Wider search bar */}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                className="pl-10 bg-secondary border-0 cursor-pointer"
                readOnly
                onClick={openSearch}
              />
            </div>
          </div>

          {/* Right: Desktop Navigation (visible only on md and up) */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <Button variant="ghost" asChild>
              <Link to="/explore">Explore</Link>
            </Button>
            <Button variant="default" asChild className="bg-primary hover:bg-primary-hover">
              <Link to="/create-project">Start a Project</Link>
            </Button>
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu & Search Icon */}
          <div className="md:hidden flex items-center gap-2"> 
            {/* Search Bar - Mobile */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                className="pl-10 bg-secondary border-0 cursor-pointer"
                readOnly
                onClick={openSearch}
              />
            </div>
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-2 animate-fade-in">
            <Button variant="ghost" asChild className="justify-start">
              <Link to="/explore">Explore</Link>
            </Button>
            <Button variant="default" asChild className="justify-start bg-primary hover:bg-primary-hover">
              <Link to="/create-project">Start a Project</Link>
            </Button>
            {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/profile">Profile</Link>
                </Button>
                <Button variant="ghost" onClick={logout} className="justify-start">
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login">Login / Sign Up</Link>
              </Button>
            )}
          </div>
        )}
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} /> {/* Render SearchOverlay */}
    </nav>
  );
};

export default Navbar;
