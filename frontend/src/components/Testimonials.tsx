import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Designer",
    image: "SJ",
    rating: 5,
    text: "DotFunding helped me bring my design project to life. The community support was incredible!",
  },
  {
    name: "Michael Chen",
    role: "Game Developer",
    image: "MC",
    rating: 5,
    text: "Raised $50k in just 2 weeks. The platform is intuitive and the backers are genuinely interested.",
  },
  {
    name: "Emma Rodriguez",
    role: "Filmmaker",
    image: "ER",
    rating: 5,
    text: "Best crowdfunding experience ever. The analytics and backer engagement tools are top-notch.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Creators</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of successful creators who brought their dreams to reality
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="animate-fade-in hover:shadow-lg transition-smooth" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground">{testimonial.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
