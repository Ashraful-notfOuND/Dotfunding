import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQItem = {
  question: string;
  answer: string;
};

interface FAQProps {
  projectId: string;
}

const FAQ = ({ projectId }: FAQProps) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();

    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching FAQs for projectId:", projectId);

        const res = await fetch(`http://localhost:5000/api/projects/faqs/${projectId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch FAQs");
        }

        const data = await res.json();
        setFaqs(data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load FAQs");
          console.error("Error fetching FAQs:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
    return () => controller.abort();
  }, [projectId]);

  if (loading) {
    return <div className="text-center py-10">Loading FAQs...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-10">{error}</div>;
  }

  if (!faqs || faqs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No FAQs have been added for this project yet.
      </div>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about this project
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full animate-fade-in">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left hover:text-primary transition-smooth">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
