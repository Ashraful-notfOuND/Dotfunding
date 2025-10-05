import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const pledgeSchema = z.object({
  amount: z.string().min(1, "Please enter a pledge amount"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Please enter your full name").max(100),
  paymentMethod: z.enum(["card", "paypal"], {
    required_error: "Please select a payment method",
  }),
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
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PledgeFormValues>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      amount: defaultAmount,
      email: "",
      fullName: "",
      paymentMethod: "card",
    },
  });

  // Update amount when defaultAmount or selectedReward changes
  useState(() => {
    if (defaultAmount) {
      form.setValue("amount", defaultAmount);
    }
  });

  const onSubmit = async (data: PledgeFormValues) => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Pledge Successful! 🎉",
      description: `Thank you for pledging $${data.amount} to ${projectTitle}. Check your email for confirmation.`,
    });

    setIsProcessing(false);
    onOpenChange(false);
    form.reset();
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

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted transition-smooth cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="font-semibold">Credit/Debit Card</div>
                          <div className="text-sm text-muted-foreground">
                            Visa, Mastercard, American Express
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted transition-smooth cursor-pointer">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                          <div className="font-semibold">PayPal</div>
                          <div className="text-sm text-muted-foreground">
                            Pay securely with your PayPal account
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
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
