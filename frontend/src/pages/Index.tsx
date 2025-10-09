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
import heroBanner from "@/assets/hero-banner.png"; // Re-import heroBanner
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { allProjects } from "@/data/allProjects";
//import { allProjects } from "@/data/mockProjects";

//const trendingProjects = allProjects.filter(p => p.status === "trending").slice(0, 3);
const trendingProjects = allProjects.filter(p => p.status === "trending").slice(0, 3);
const recommendedProjects = allProjects
  .filter(p => p.status !== "trending")
  .slice(0, 3);


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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const renderProjectCards = (projects: typeof allProjects) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)
        : projects.map((project) => <ProjectCard key={project.id} {...project} />)}
    </div>
  );

  const renderCarouselItems = (projects: typeof allProjects) => (
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-primary-light to-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
      >
        {/* <ParticleBackground /> */}
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-6" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }}>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Bring <TypewriterText 
                  texts={["Innovative", "Visionary", "Creative"]}
                  speed={100}
                  infinite={true}
                  pauseDuration={2000}
                  className="inline"
                /> Projects to Life
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover and support groundbreaking ideas. Start your own campaign and turn your
                vision into reality with community backing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent-hover text-accent-foreground"
                  asChild
                >
                  <Link to="/create-project">Start a Project</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/explore">Explore Projects</Link>
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">$2.5B+</div>
                  <div className="text-sm text-muted-foreground">Funded</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">450K+</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">15M+</div>
                  <div className="text-sm text-muted-foreground">Backers</div>
                </div>
              </div>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }}>
              <img
                src={heroBanner}
                alt="Creative collaboration"
                className="rounded-2xl shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

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
              {renderCarouselItems(allProjects.filter(p => (p.fundingCurrent / p.fundingGoal) >= 0.8 && (p.fundingCurrent / p.fundingGoal) < 1))}
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
      const justLaunchedProjects = allProjects.filter((p, i) => {
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
