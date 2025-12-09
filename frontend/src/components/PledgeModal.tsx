// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useToast } from "@/hooks/use-toast";
// import { Check } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// // Stripe Imports - not needed for this full frontend mock
// // import { loadStripe } from "@stripe/stripe-js";

// // Make sure to call `loadStripe` outside of a component’s render to avoid
// // recreating the Stripe object on every render.
// // This is your test publishable API key.
// // const stripePromise = loadStripe("pk_test_TYooMQauvdEDq55EcsfUMGaQ"); // Replace with your actual publishable key

// const pledgeSchema = z.object({
//   amount: z.string().min(1, "Please enter a pledge amount"),
//   email: z.string().email("Please enter a valid email address"),
//   fullName: z.string().min(2, "Please enter your full name").max(100),
//   phone: z.string().min(5, "Please enter a valid phone number"),
// });

// type PledgeFormValues = z.infer<typeof pledgeSchema>;

// interface PledgeModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void; 
//   projectTitle: string;
//   defaultAmount?: string;
//   selectedReward?: {
//     amount: number;
//     title: string;
//     description: string;
//   } | null;
//   projectId?: string | null;
//   userId?: string | null;
// }

// const PledgeModal = ({
//   open,
//   onOpenChange,
//   projectTitle,
//   defaultAmount = "",
//   selectedReward,
//   projectId,
//   userId,
// }: PledgeModalProps) => {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const [isProcessing, setIsProcessing] = useState(false);

//   const form = useForm<PledgeFormValues>({
//     resolver: zodResolver(pledgeSchema),
//     defaultValues: {
//       amount: defaultAmount,
//       email: "",
//       fullName: "",
//       phone: "",
//     },
//   });

//   useEffect(() => {
//     if (defaultAmount) {
//       form.setValue("amount", defaultAmount);
//     }
//   }, [defaultAmount, form]);

//   const onSubmit = async (data: PledgeFormValues) => {
//     setIsProcessing(true);

//     try {
//       // build a unique tran_id
//       const tran_id = `tran_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
//       const amount = Number(data.amount || 0);

//       // success/fail URLs point to backend which will validate and then redirect to frontend
//       // Use Vite env vars (import.meta.env). Set VITE_BACKEND_URL in your frontend .env
//       // Fallbacks are provided for local dev.
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const env: any = import.meta.env || {};
//       const backendBase = env.VITE_BACKEND_URL || "http://localhost:5000";
//       // Build a frontend return URL so after payment the user can be redirected back to the project page
//       const frontendBase = env.VITE_FRONTEND_URL || env.VITE_FRONTEND_BASE || "http://localhost:5173";
//       const frontendProjectUrl = `${frontendBase.replace(/\/$/, "")}/project/${encodeURIComponent(projectId || "")}`;

//       const successUrl = `${backendBase}/api/payments/success?project_id=${encodeURIComponent(
//         projectId || ""
//       )}&user_id=${encodeURIComponent(userId || "")} ${selectedReward && (selectedReward as any).id ? `&reward_id=${encodeURIComponent((selectedReward as any).id)}` : ""}&amount=${encodeURIComponent(String(amount))}&return_url=${encodeURIComponent(frontendProjectUrl)}`;
//       const failUrl = env.VITE_FRONTEND_FAIL_URL || "http://localhost:5173/payment-fail";
//       const cancelUrl = env.VITE_FRONTEND_CANCEL_URL || "http://localhost:5173/";
//       const ipnUrl = `${backendBase}/api/payments/ipn`;

//       const payload = {
//         total_amount: amount,
//         currency: "BDT",
//         tran_id,
//         // Indicate no shipping required for pledges
//         shipping_method: "NO",
//         success_url: successUrl,
//         fail_url: failUrl,
//         cancel_url: cancelUrl,
//         ipn_url: ipnUrl,
//   product_name: projectTitle || "Pledge",
//   cus_name: data.fullName,
//   cus_phone: data.phone,
//   cus_email: data.email,
//         // include project/reward info for the success redirect
//         project_id: projectId || null,
//         user_id: userId || null,
//         reward_id: (selectedReward as any)?.id || null,
//       };

//       const res = await fetch(`${backendBase}/api/payments/init`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         toast({ title: "Payment init failed", description: err?.error || "Could not initialize payment." });
//         setIsProcessing(false);
//         return;
//       }

//       const dataResp = await res.json();
//       const gateway = dataResp?.GatewayPageURL || dataResp?.GatewayPageURL || dataResp?.redirect_url || dataResp?.payment_url;
//       if (!gateway) {
//         toast({ title: "Payment init failed", description: "No gateway URL returned" });
//         setIsProcessing(false);
//         return;
//       }

//       // Redirect user to payment gateway
//       window.location.href = gateway;
//       return;
//     } catch (err) {
//       console.error("Payment init error:", err);
//       toast({ title: "Payment error", description: "Network or server error when initiating payment." });
//     } finally {
//       setIsProcessing(false);
//       onOpenChange(false);
//       form.reset();
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl">Back This Project</DialogTitle>
//           <DialogDescription>
//             Enter your pledge details to support {projectTitle}
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             {/* Selected Reward Summary */}
//             {selectedReward && (
//               <div className="bg-primary-light dark:bg-primary-light border-l-4 border-primary p-4 rounded-md">
//                 <div className="flex items-start gap-3">
//                   <div className="bg-primary text-primary-foreground rounded-full p-1 mt-0.5">
//                     <Check className="h-4 w-4" />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-foreground">
//                       ${selectedReward.amount} - {selectedReward.title}
//                     </h4>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {selectedReward.description}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Pledge Amount */}
//             <FormField
//               control={form.control}
//               name="amount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Pledge Amount ($)</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       placeholder="Enter amount"
//                       min="1"
//                       {...field}
//                       className="text-lg"
//                       readOnly={!!selectedReward}
//                       disabled={!!selectedReward}
//                     />
//                   </FormControl>
//                   {selectedReward && (
//                     <p className="text-sm text-muted-foreground">
//                       Amount is fixed for this reward tier
//                     </p>
//                   )}
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Full Name */}
//             <FormField
//               control={form.control}
//               name="fullName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Full Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="John Doe" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Email */}
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email Address</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="email"
//                       placeholder="john@example.com"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Phone */}
//             <FormField
//               control={form.control}
//               name="phone"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Phone Number</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="tel"
//                       placeholder="017xxxxxxxx"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Action Buttons */}
//             <div className="flex gap-3 pt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//                 className="flex-1"
//                 disabled={isProcessing}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 className="flex-1 bg-accent hover:bg-accent-hover"
//                 disabled={isProcessing}
//               >
//                 {isProcessing ? "Processing..." : `Pledge $${form.watch("amount") || "0"}`}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PledgeModal;

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
import { useNavigate, Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

// Stripe Imports - not needed for this full frontend mock
// import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
// const stripePromise = loadStripe("pk_test_TYooMQauvdEDq55EcsfUMGaQ"); // Replace with your actual publishable key

const pledgeSchema = z.object({
  amount: z.string().min(1, "Please enter a pledge amount"),
  donorMessage: z.string().optional(),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
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
  projectId?: string | null;
  userId?: string | null;
  ownerId?: string | null;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

const PledgeModal = ({
  open,
  onOpenChange,
  projectTitle,
  defaultAmount = "",
  selectedReward,
  projectId,
  userId,
  ownerId,
  userEmail,
  userName,
  userPhone,
}: PledgeModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PledgeFormValues>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      amount: defaultAmount,
      donorMessage: "",
      acceptedTerms: false,
    },
  });

  useEffect(() => {
    if (defaultAmount) {
      form.setValue("amount", defaultAmount);
    }
  }, [defaultAmount, form]);

  const onSubmit = async (data: PledgeFormValues) => {
    setIsProcessing(true);

    // Show warning if user doesn't have phone number in profile
    if (!userPhone) {
      toast({
        title: "Missing phone number",
        description: "Using default phone number. Please update your profile with your phone number.",
        variant: "default",
      });
    }

    try {
      // build a unique tran_id
      const tran_id = `tran_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const amount = Number(data.amount || 0);

      // success/fail URLs point to backend which will validate and then redirect to frontend
      // Use Vite env vars (import.meta.env). Set VITE_BACKEND_URL in your frontend .env
      // Fallbacks are provided for local dev.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env: any = import.meta.env || {};
      const backendBase = env.VITE_BACKEND_URL || "http://localhost:5000";
      // Build a frontend return URL so after payment the user can be redirected back to the project page
      const frontendBase = env.VITE_FRONTEND_URL || env.VITE_FRONTEND_BASE || "http://localhost:8080";
      const frontendProjectUrl = `${frontendBase.replace(/\/$/, "")}/project/${encodeURIComponent(projectId || "")}`;

      const successUrl = `${backendBase}/api/payments/success?project_id=${encodeURIComponent(
        projectId || ""
      )}&user_id=${encodeURIComponent(userId || "")}${selectedReward && (selectedReward as any).id ? `&reward_id=${encodeURIComponent((selectedReward as any).id)}` : ""}&amount=${encodeURIComponent(String(amount))}&return_url=${encodeURIComponent(frontendProjectUrl)}`;
      const failUrl = env.VITE_FRONTEND_FAIL_URL || "http://localhost:8080/payment-fail";
      const cancelUrl = env.VITE_FRONTEND_CANCEL_URL || "http://localhost:8080/";
      const ipnUrl = `${backendBase}/api/payments/ipn`;

      const payload = {
        total_amount: amount,
        currency: "BDT",
        tran_id,
        shipping_method: "NO",
        success_url: successUrl,
        fail_url: failUrl,
        cancel_url: cancelUrl,
        ipn_url: ipnUrl,
        product_name: projectTitle || "Pledge",
        cus_name: userName || "Anonymous Donor",
        cus_phone: userPhone || "01700000000", // Valid Bangladesh phone format
        cus_email: userEmail || "donor@dotfunding.com",
        donor_message: data.donorMessage || "",

        project_id: projectId || null,
        user_id: userId || null,
        owner_id: ownerId || null,
        reward_id: (selectedReward as any)?.id || null,
        return_url: frontendProjectUrl, // Add return_url to payload body
      };

      const res = await fetch(`${backendBase}/api/payments/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Payment init failed", description: err?.error || "Could not initialize payment." });
        setIsProcessing(false);
        return;
      }

      const dataResp = await res.json();
      const gateway = dataResp?.GatewayPageURL || dataResp?.gatewayPageURL || dataResp?.redirect_url || dataResp?.payment_url;
      if (!gateway) {
        toast({ title: "Payment init failed", description: "No gateway URL returned" });
        setIsProcessing(false);
        return;
      }

      console.log("Redirecting to payment gateway:", gateway);

      // Redirect user to payment gateway
      window.location.href = gateway;
    } catch (err) {
      console.error("Payment init error:", err);
      toast({ title: "Payment error", description: "Network or server error when initiating payment." });
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
      form.reset();
    }
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

            {/* Display User Info (Read-only) */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Your Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{userName || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{userEmail || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span>{userPhone || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Donor Message (Optional) */}
            <FormField
              control={form.control}
              name="donorMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave a Message (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Share why you're supporting this project..."
                      className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      maxLength={500}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Your message will be visible to the project creator
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms and Conditions Checkbox */}
            <FormField
              control={form.control}
              name="acceptedTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      I agree to the{" "}
                      <Link 
                        to="/terms" 
                        target="_blank" 
                        className="text-primary hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms and Conditions
                      </Link>
                      {" "}for backing this project
                    </FormLabel>
                    <FormMessage />
                  </div>
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
                disabled={isProcessing || !form.watch("acceptedTerms")}
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
