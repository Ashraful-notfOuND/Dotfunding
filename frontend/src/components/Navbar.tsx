import { Link, useNavigate } from "react-router-dom";
import { Search, User, Menu, LogOut, Bell, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import SearchOverlay from "@/components/SearchOverlay"; // Import SearchOverlay

interface NavbarProps {
  hideSearch?: boolean;
  showAnalyticsButton?: boolean;
  showingAnalytics?: boolean;
  onAnalyticsClick?: () => void;
}

const Navbar = ({ hideSearch, showAnalyticsButton, showingAnalytics, onAnalyticsClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate(); // ✅ added navigate

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // Fetch unread notification count
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchUnreadCount = async () => {
      try {
        const resp = await fetch(`http://localhost:5000/api/notifications/${user.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (resp.ok) {
          const data = await resp.json();
          const notifications = Array.isArray(data.notifications) ? data.notifications : [];
          const unread = notifications.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // handle logout + redirect
  const handleLogout = () => {
    logout();      // clear auth state
    navigate("/"); // redirect to home
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xl">D</span>
            </div>
            <span className="hidden sm:inline">
              <span className="text-black">Dot</span>
              <span className="ml-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Funding</span>
            </span>
          </Link>

          {/* Center: Desktop Search Bar */}
          {!hideSearch && (
            <div className="hidden md:flex flex-grow justify-center mx-4">
              <div className="relative w-full max-w-lg">
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
          )}

          {/* Right: Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {!showAnalyticsButton && (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/explore">Explore</Link>
                </Button>
                {!user?.isAdmin && (
                  <Button variant="default" asChild className="bg-primary hover:bg-primary-hover">
                    <Link to="/create-project">Start a Project</Link>
                  </Button>
                )}
              </>
            )}
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <Button variant="ghost" asChild className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
                )}
                {showAnalyticsButton && (
                  <Button 
                    variant="default" 
                    onClick={onAnalyticsClick}
                    className={`px-4 transition-all ${showingAnalytics ? 'bg-accent hover:bg-accent-hover' : 'bg-primary hover:bg-primary-hover'} text-white`}
                  >
                    {showingAnalytics ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        User View
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Creator Analytics
                      </>
                    )}
                  </Button>
                )}
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link to="/profile?tab=notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
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
            {!hideSearch && (
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
            )}
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
            {!user?.isAdmin && (
              <Button variant="default" asChild className="justify-start bg-primary hover:bg-primary-hover">
                <Link to="/create-project">Start a Project</Link>
              </Button>
            )}
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <Button variant="ghost" asChild className="justify-start bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
                )}
                <Button variant="ghost" asChild className="justify-start relative">
                  <Link to="/profile?tab=notifications" className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/profile">Profile</Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="justify-start">
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
      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
    </nav>
  );
};

export default Navbar;
