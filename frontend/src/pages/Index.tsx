import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import ProjectCardSkeleton from "@/components/ProjectCardSkeleton";
// import ParticleBackground from "@/components/ParticleBackground";
import TypewriterText from "@/components/TypewriterText";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import StatsCounter from "@/components/StatsCounter";
import SuccessStories from "@/components/SuccessStories";
import { Search, Sparkles, Users, Target, TrendingUp } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg"; // Re-import heroBanner
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { allProjects as staticProjects } from "@/data/allProjects";
import HeroLanding from "@/components/landing/HeroLanding";
import FeaturesLanding from "@/components/landing/FeaturesLanding";
import CTALanding from "@/components/landing/CTALanding";
//import { allProjects } from "@/data/mockProjects";

// (We'll derive these from fetched projects inside the component)


const categories = [
  { name: "Technology", icon: Sparkles, count: 234 },
  { name: "Art", icon: Users, count: 567 },
  { name: "Games", icon: Target, count: 189 },
  { name: "Design", icon: TrendingUp, count: 345 },
  { name: "Film", icon: Sparkles, count: 156 },
  { name: "Music", icon: Users, count: 423 },
];

const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Opacity: 0 when entering, 1 when fully in view, stays 1
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]); // Animation completes at 50%
  // Scale: 0.5 when entering, 1 when fully in view, stays 1
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.5, 1]); // Animation completes at 50%

  return (
    <motion.div ref={ref} style={{ opacity, scale }}>
      {children}
    </motion.div>
  );
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 1200);

    const fetchProjects = async () => {
      try {
        const backend = (import.meta.env as any).VITE_BACKEND_URL || "http://localhost:5000";
        const res = await fetch(`${backend}/api/projects`);
        if (!res.ok) {
          console.warn("Failed to fetch projects from backend, using static fallback");
          setProjects(staticProjects as any);
          return;
        }
        const body = await res.json();
        if (mounted) setProjects(body.projects || staticProjects as any);
      } catch (e) {
        console.warn("Error fetching projects, using static fallback", e);
        setProjects(staticProjects as any);
      }
    };

    fetchProjects();

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const renderProjectCards = (projects: typeof staticProjects) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)
        : projects.map((project) => <ProjectCard key={project.id} {...project} />)}
    </div>
  );

  const renderCarouselItems = (projects: typeof staticProjects) => (
    <CarouselContent>
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => (
          <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <ProjectCardSkeleton />
            </div>
          </CarouselItem>
        ))
        : projects.map((project) => (
          <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <ProjectCard {...project} />
            </div>
          </CarouselItem>
        ))}
    </CarouselContent>
  );

  // sourceProjects: prefer backend-fetched projects, fallback to static data
  const sourceProjects = projects || (staticProjects as any[]);
  const trendingProjects = sourceProjects.slice(0, 3);
  const recommendedProjects = sourceProjects.slice(3, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Particle background is mounted inside the Hero component now */}

      {/* New landing components */}
      <HeroLanding />
      <FeaturesLanding />
      <CTALanding />

      {/* Trending Projects */}
      <AnimatedSection>
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Projects</h2>
              <p className="text-muted-foreground">Hottest campaigns right now</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/explore">View All</Link>
            </Button>
          </div>
          {renderProjectCards(trendingProjects)}
        </section>
      </AnimatedSection>

      {/* Categories */}
      <AnimatedSection>
        <section className="bg-secondary/50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">Explore projects across different domains</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/category/${category.name.toLowerCase()}`}
                  className="group"
                >
                  <motion.div
                    className="bg-card rounded-lg p-6 text-center hover:shadow-lg transition-smooth border border-border"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <category.icon className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-smooth" />
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} projects</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Recommended Projects */}
      <AnimatedSection>
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Recommended for You</h2>
            <p className="text-muted-foreground">Projects we think you'll love</p>
          </div>
          {renderProjectCards(recommendedProjects)}
        </section>
      </AnimatedSection>

      {/* Almost There */}
      <AnimatedSection>
        <section className="bg-secondary/50 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Almost There</h2>
              <p className="text-muted-foreground">Projects close to their funding goal. Help them cross the finish line!</p>
            </div>
            <Carousel opts={{ align: "start", loop: true }}>
              {renderCarouselItems(sourceProjects.filter(p => p.fundingGoal>0 && (p.fundingCurrent / p.fundingGoal) >= 0.8 && (p.fundingCurrent / p.fundingGoal) < 1))}
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      </AnimatedSection>

      {/* Just Launched */}
      <AnimatedSection>
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Just Launched</h2>
            <p className="text-muted-foreground">
              Be one of the first to support these new projects.
            </p>
          </div>

          {(() => {
            // ✅ Define the cutoff (2 days ago)
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            // ✅ Safely filter projects (handles missing createdDate)
            const justLaunchedProjects = sourceProjects.filter((p: any, i) => {
              // Use real createdDate if available, or generate a fallback for testing
              const createdDate =
                p.createdDate instanceof Date
                  ? p.createdDate
                  : new Date(Date.now() - i * 86400000); // fallback: older by index

              return createdDate > twoDaysAgo;
            });

            return justLaunchedProjects.length > 0 ? (
              <Carousel opts={{ align: "start", loop: true }}>
                {renderCarouselItems(justLaunchedProjects)}
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <p className="text-muted-foreground">No recently launched projects.</p>
            );
          })()}
        </section>
      </AnimatedSection>


      {/* Stats Counter */}
      <AnimatedSection>
        <StatsCounter />
      </AnimatedSection>

      {/* Success Stories */}
      <AnimatedSection>
        <SuccessStories />
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection>
        <Testimonials />
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection>
        <FAQ />
      </AnimatedSection>

      {/* Newsletter */}
      <AnimatedSection>
        <Newsletter />
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Bring Your Idea to Life?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of creators who have successfully funded their projects with community
              support.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link to="/create-project">Start Your Project Today</Link>
            </Button>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default Index;
