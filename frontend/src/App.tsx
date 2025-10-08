import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom"; // Removed BrowserRouter
import { AnimatePresence, motion } from "framer-motion"; // Added framer-motion imports

import Index from "./pages/Index";
import Explore from "./pages/Explore";
import ProjectDetail from "./pages/ProjectDetail";
import CreateProject from "./pages/CreateProject";
import CategoryPage from "./pages/Categorypage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EditProject from "./pages/EditProject";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// PageWrapper component for transitions
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const App = () => {
  const location = useLocation(); // useLocation is now inside BrowserRouter context

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
            <Route path="/explore" element={<PageWrapper><Explore /></PageWrapper>} />
            <Route path="/project/:id" element={<PageWrapper><ProjectDetail /></PageWrapper>} />   
            <Route path="/create-project" element={<PageWrapper><CreateProject /></PageWrapper>} />
            <Route path="/projects/category/:category" element={<CategoryPage />} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="/profile/edit" element={<PageWrapper><EditProfile /></PageWrapper>} />
                      <Route path="/project/:id/edit" element={<PageWrapper><EditProject /></PageWrapper>} />
                      <Route path="/payment-success" element={<PageWrapper><PaymentSuccess /></PageWrapper>} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
