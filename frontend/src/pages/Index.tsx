import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import ProjectCardSkeleton from "@/components/ProjectCardSkeleton";
import ParticleBackground from "@/components/ParticleBackground";
import TypewriterText from "@/components/TypewriterText";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import StatsCounter from "@/components/StatsCounter";
import SuccessStories from "@/components/SuccessStories";
import { Search, Sparkles, Users, Target, TrendingUp } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import projectTech from "@/assets/project-tech.jpg";
import projectArt from "@/assets/project-art.jpg";
import projectGame from "@/assets/project-game.jpg";
import projectDesign from "@/assets/project-design.jpg";
import projectFilm from "@/assets/project-film.jpg";
import projectMusic from "@/assets/project-music.jpg";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const allProjects = [
  {
    id: "1",
    title: "Revolutionary Smart Watch with Health Monitoring",
    creator: "TechInnovate",
    image: projectTech,
    fundingGoal: 50000,
    fundingCurrent: 48500, // Almost there
    daysLeft: 3,
    category: "Technology",
    isTrending: true,
    createdDate: new Date(new Date().setDate(new Date().getDate() - 20)),
  },
  {
    id: "2",
    title: "Art Book: Journey Through Modern Abstract Painting",
    creator: "Sarah Mitchell",
    image: projectArt,
    fundingGoal: 15000,
    fundingCurrent: 18200, // Funded
    daysLeft: 8,
    category: "Art",
    isTrending: true,
    createdDate: new Date(new Date().setDate(new Date().getDate() - 40)),
  },
  {
    id: "3",
    title: "Epic Fantasy Board Game: Dragon's Quest",
    creator: "GameCraft Studios",
    image: projectGame,
    fundingGoal: 35000,
    fundingCurrent: 28500, // Almost there
    daysLeft: 15,
    category: "Games",
    isTrending: true,
    createdDate: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    id: "4",
    title: "Sustainable Bamboo Home Furniture Collection",
    creator: "EcoDesign Co.",
    image: projectDesign,
    fundingGoal: 25000,
    fundingCurrent: 12400,
    daysLeft: 20,
    category: "Design",
    isTrending: false,
    createdDate: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
  {
    id: "5",
    title: "Independent Film: Stories from the City",
    creator: "Urban Films",
    image: projectFilm,
    fundingGoal: 45000,
    fundingCurrent: 1200, // Just launched
    daysLeft: 58,
    category: "Film",
    isTrending: false,
    createdDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Just launched
  },
  {
    id: "6",
    title: "Album Recording: Jazz Fusion Experience",
    creator: "The Groove Collective",
    image: projectMusic,
    fundingGoal: 20000,
    fundingCurrent: 19800, // Almost there
    daysLeft: 2,
    category: "Music",
    isTrending: false,
    createdDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  },
];

const trendingProjects = allProjects.filter(p => p.isTrending);
const recommendedProjects = allProjects.filter(p => !p.isTrending).slice(0, 3);

const categories = [
  { name: "Technology", icon: Sparkles, count: 234 },
  { name: "Art", icon: Users, count: 567 },
  { name: "Games", icon: Target, count: 189 },
  { name: "Design", icon: TrendingUp, count: 345 },
  { name: "Film", icon: Sparkles, count: 156 },
  { name: "Music", icon: Users, count: 423 },
];


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

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-primary-light to-background"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
        }}
      >
        <ParticleBackground />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-6" variants={sectionVariants}>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Bring Creative{" "}
                <TypewriterText 
                  text="Projects to"
                  highlightText="Life"
                  speed={100}
                  infinite={true}
                  pauseDuration={2000}
                  className="inline"
                />
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
            <motion.div className="relative" variants={sectionVariants}>
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
      <motion.section 
        className="container mx-auto px-4 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
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
      </motion.section>

      {/* Categories */}
      <motion.section 
        className="bg-secondary/50 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
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
      </motion.section>

      {/* Recommended Projects */}
      <motion.section 
        className="container mx-auto px-4 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Recommended for You</h2>
          <p className="text-muted-foreground">Projects we think you'll love</p>
        </div>
        {renderProjectCards(recommendedProjects)}
      </motion.section>

      {/* Almost There */}
      <motion.section 
        className="bg-secondary/50 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
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
      </motion.section>

      {/* Just Launched */}
      <motion.section 
        className="container mx-auto px-4 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Just Launched</h2>
          <p className="text-muted-foreground">Be one of the first to support these new projects.</p>
        </div>
        <Carousel opts={{ align: "start", loop: true }}>
          {renderCarouselItems(allProjects.filter(p => {
            const twoDaysAgo = new Date(new Date().setDate(new Date().getDate() - 2));
            return p.createdDate > twoDaysAgo;
          }))}
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </motion.section>

      {/* Stats Counter */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <StatsCounter />
      </motion.div>

      {/* Success Stories */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <SuccessStories />
      </motion.div>

      {/* Testimonials */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <Testimonials />
      </motion.div>

      {/* FAQ */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <FAQ />
      </motion.div>

      {/* Newsletter */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <Newsletter />
      </motion.div>

      {/* CTA Section */}
      <motion.section 
        className="gradient-hero text-primary-foreground py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
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
      </motion.section>

      <Footer />
    </div>
  );
};

export default Index;
