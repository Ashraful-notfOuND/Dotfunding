import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ConfirmModal from "./ConfirmModal"; // ✅ import the modal

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

interface FAQProps {
  projectId?: string;
  isOwner?: boolean;
}

const FAQ = ({ projectId, isOwner = false }: FAQProps) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:5000/api/faqs/${projectId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setFaqs([]);
          return;
        }

        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err.name !== "AbortError") setError("Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
    return () => controller.abort();
  }, [projectId]);

  const handleAddFAQ = async () => {
    if (!question.trim() || !answer.trim() || !projectId) return;

    try {
      setPosting(true);

      const res = await fetch("http://localhost:5000/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, question, answer }),
      });

      if (!res.ok) throw new Error("Failed to add FAQ");

      const newFaq = await res.json();
      setFaqs((prev) => [...prev, newFaq]);

      setQuestion("");
      setAnswer("");
      setShowForm(false);
    } catch (err) {
      console.error("Add FAQ error:", err);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteFAQ = async () => {
    if (!selectedFAQ) return;

    try {
      await fetch(`http://localhost:5000/api/faqs/item/${selectedFAQ}`, {
        method: "DELETE",
      });
      setFaqs((prev) => prev.filter((f) => f.id !== selectedFAQ));
    } catch (err) {
      console.error("Delete FAQ error:", err);
    } finally {
      setShowConfirm(false);
      setSelectedFAQ(null);
    }
  };

  if (loading) return <div className="text-center py-10">Loading FAQs...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;

  return (
    <section className="pt-4 pb-8">
     <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-left">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          {isOwner && !showForm && (
            <Button onClick={() => setShowForm(true)} size="sm">
              Add FAQ
            </Button>
          )}
        </div>

        {/* Add FAQ Form */}
        {isOwner && showForm && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">Add a FAQ</h3>
            <Input
              placeholder="Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Textarea
              placeholder="Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddFAQ} disabled={posting}>
                {posting ? "Posting..." : "Post FAQ"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* FAQ List */}
        {faqs.length === 0 ? (
          <div className="text-left text-muted-foreground py-10">
            No FAQs posted by the creator
          </div>
        ) : (
          faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 relative"
            >
              <div className="mb-2 font-semibold text-gray-900">
                {index + 1}. {faq.question}
              </div>
              <div className="text-gray-700">{faq.answer}</div>

              {isOwner && (
                <div className="absolute bottom-4 right-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedFAQ(faq.id);
                      setShowConfirm(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))
        )}

        {/* ✅ Confirm Modal */}
        <ConfirmModal
          open={showConfirm}
          title="Confirm Delete"
          message="Are you sure you want to delete this FAQ?"
          onConfirm={handleDeleteFAQ}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </section>
  );
};

export default FAQ;
