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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EditProject from "./pages/EditProject";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import CreatorProfile from "./pages/CreatorProfile";
import AuthCallback from "./pages/AuthCallback";
import TermsAndConditions from "./pages/TermsAndConditions";
import AdminDashboard from "./pages/AdminDashboard";
import ProjectTimeline from "./pages/ProjectTimeline";
import ProjectOutcome from "./pages/ProjectOutcome";
// Demo Pages (for screenshots/presentations)
import ProjectSuccess from "./pages/demo/ProjectSuccess";
import PaymentBreakdown from "./pages/demo/PaymentBreakdown";
import NextSteps from "./pages/demo/NextSteps";
import CampaignUnsuccessful from "./pages/demo/CampaignUnsuccessful";
import CampaignInsights from "./pages/demo/CampaignInsights";
import CampaignNextSteps from "./pages/demo/CampaignNextSteps";
import MilestonesSetup from "./pages/project/MilestonesSetup";


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
            <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<PageWrapper><TermsAndConditions /></PageWrapper>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="/profile/edit" element={<PageWrapper><EditProfile /></PageWrapper>} />
                      <Route path="/project/:id/edit" element={<PageWrapper><EditProject /></PageWrapper>} />
                      <Route path="/project/:id/timeline" element={<PageWrapper><ProjectTimeline /></PageWrapper>} />
                      <Route path="/payment-success" element={<PageWrapper><PaymentSuccess /></PageWrapper>} />
                      <Route path="/creator/:id" element={<PageWrapper><CreatorProfile /></PageWrapper>} />
                      <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                      {/* Project Outcome Router - Checks success/failure and routes accordingly */}
                      <Route path="/project/:id/outcome" element={<PageWrapper><ProjectOutcome /></PageWrapper>} />
                      {/* Project Outcome Workflow - Successful */}
                      <Route path="/project/outcome/success" element={<PageWrapper><ProjectSuccess /></PageWrapper>} />
                      <Route path="/project/:id/milestones/setup" element={<PageWrapper><MilestonesSetup /></PageWrapper>} />
                      <Route path="/project/outcome/payment" element={<PageWrapper><PaymentBreakdown /></PageWrapper>} />
                      <Route path="/demo/payment-breakdown" element={<PageWrapper><PaymentBreakdown /></PageWrapper>} />
                      <Route path="/project/outcome/next-steps" element={<PageWrapper><NextSteps /></PageWrapper>} />
                      {/* Campaign Outcome Workflow - Unsuccessful */}
                      <Route path="/campaign/unsuccessful" element={<PageWrapper><CampaignUnsuccessful /></PageWrapper>} />
                      <Route path="/campaign/insights" element={<PageWrapper><CampaignInsights /></PageWrapper>} />
                      <Route path="/campaign/next-steps" element={<PageWrapper><CampaignNextSteps /></PageWrapper>} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
