import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Stripe Imports - not needed for this full frontend mock
// import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
// const stripePromise = loadStripe("pk_test_TYooMQauvdEDq55EcsfUMGaQ"); // Replace with your actual publishable key

const pledgeSchema = z.object({
  amount: z.string().min(1, "Please enter a pledge amount"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Please enter your full name").max(100),
});

type PledgeFormValues = z.infer<typeof pledgeSchema>;

interface PledgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  defaultAmount?: string;
  selectedReward?: {
    amount: number;
    title: string;
    description: string;
  } | null;
}

const PledgeModal = ({
  open,
  onOpenChange,
  projectTitle,
  defaultAmount = "",
  selectedReward,
}: PledgeModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PledgeFormValues>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      amount: defaultAmount,
      email: "",
      fullName: "",
    },
  });

  useEffect(() => {
    if (defaultAmount) {
      form.setValue("amount", defaultAmount);
    }
  }, [defaultAmount, form]);

  const onSubmit = async (data: PledgeFormValues) => {
    setIsProcessing(true);

    // --- FULLY SIMULATED STRIPE CHECKOUT FLOW (FRONTEND ONLY) ---
    console.log("Simulating backend call to create Checkout Session...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    // Simulate successful redirect to Stripe and then back to success page
    toast({
      title: "Redirecting to Stripe...",
      description: "Please complete your payment on the secure Stripe page.",
    });

    // Simulate a short delay before redirecting to our mock success page
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, Stripe would redirect back to your success_url
    // Here, we navigate directly to a mock success page on our frontend.
    navigate("/payment-success"); // Navigate to a mock success page

    setIsProcessing(false);
    onOpenChange(false); // Close modal after simulated redirect
    form.reset();
    // --- END SIMULATION ---
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Back This Project</DialogTitle>
          <DialogDescription>
            Enter your pledge details to support {projectTitle}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Selected Reward Summary */}
            {selectedReward && (
              <div className="bg-primary-light dark:bg-primary-light border-l-4 border-primary p-4 rounded-md">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full p-1 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      ${selectedReward.amount} - {selectedReward.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedReward.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pledge Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pledge Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      min="1"
                      {...field}
                      className="text-lg"
                      readOnly={!!selectedReward}
                      disabled={!!selectedReward}
                    />
                  </FormControl>
                  {selectedReward && (
                    <p className="text-sm text-muted-foreground">
                      Amount is fixed for this reward tier
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent-hover"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Pledge $${form.watch("amount") || "0"}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PledgeModal;