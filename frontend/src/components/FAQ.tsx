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
  projectId?: string;
}

const FAQ = ({ projectId }: FAQProps) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      // No projectId provided: show a small set of generic FAQs for the landing page
      setFaqs([
        { question: "How does funding work?", answer: "Back a project with any amount. Funds are collected and transferred to creators when goals are met." },
        { question: "When will I get my reward?", answer: "Reward delivery times are listed on each project page and depend on the creator." },
        { question: "Is my payment secure?", answer: "We use industry-standard gateways for payments. You will be redirected to a secure checkout." },
      ]);
      setLoading(false);
      return;
    }

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

<Accordion type="single" collapsible className="w-full animate-fade-in space-y-4">
  {faqs.map((faq, index) => (
    <AccordionItem
      key={index}
      value={`item-${index}`}
      className="border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-card"
    >
      <AccordionTrigger className="text-left flex items-start gap-3 px-6 py-4 text-lg md:text-xl font-semibold hover:text-primary transition-colors">
        <span className="text-primary font-bold">{index + 1}.</span>
        <span className="flex-1">{faq.question}</span>
      </AccordionTrigger>
      <AccordionContent className="px-6 py-4 text-muted-foreground text-base md:text-lg bg-background/50 rounded-b-xl">
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
