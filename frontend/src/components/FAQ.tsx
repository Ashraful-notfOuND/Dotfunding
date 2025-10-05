import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does DotFunding work?",
    answer: "Creators launch projects, set funding goals, and offer rewards. Backers pledge money to help bring projects to life. If the goal is met, backers are charged and creators receive funding.",
  },
  {
    question: "What fees does DotFunding charge?",
    answer: "We charge a 5% platform fee on successfully funded projects, plus payment processing fees (typically 3-5%). There are no upfront costs to launch a project.",
  },
  {
    question: "What happens if a project doesn't reach its goal?",
    answer: "If a project doesn't reach its funding goal by the deadline, no backers are charged and no money changes hands. The project can be relaunched with adjustments.",
  },
  {
    question: "How long does it take to receive funding?",
    answer: "Once your project successfully funds, you'll receive your money within 7-14 business days after the campaign ends, minus our platform fees.",
  },
  {
    question: "Can I offer physical or digital rewards?",
    answer: "Yes! You can offer both physical products and digital rewards. Make sure to factor in production and shipping costs when setting your funding goal.",
  },
  {
    question: "Is there a limit to how much I can raise?",
    answer: "No, there's no upper limit. However, we recommend setting realistic goals based on your project scope and audience size.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about launching your project
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
