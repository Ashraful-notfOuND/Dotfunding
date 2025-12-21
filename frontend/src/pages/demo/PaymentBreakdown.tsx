import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  DollarSign, 
  CreditCard, 
  Building2, 
  Calendar,
  Info,
  CheckCircle,
  ArrowRight
} from "lucide-react";

/**
 * DEMO PAGE 2: Payment & Fee Breakdown
 * Purpose: Screenshot for presentation slides
 * Shows transparent fee breakdown and payout information
 */
export default function PaymentBreakdown() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Payment Breakdown</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Transparent breakdown of your campaign funds
          </p>
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Financial Summary</CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Funded Successfully
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            {/* Total Raised */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-6 mb-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">Total Funds Raised</p>
                    <p className="text-xs text-green-700 dark:text-green-400">From 7 backers</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">৳2,847.00</p>
              </div>
            </div>

            {/* Fees Breakdown */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Deductions
              </h3>

              {/* Platform Fee */}
              <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Platform Fee</p>
                    <p className="text-sm text-muted-foreground">5% of total raised</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-muted-foreground">-৳142.35</p>
              </div>

              {/* Payment Processing Fee */}
              <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Payment Processing Fee</p>
                    <p className="text-sm text-muted-foreground">2.9% + ৳0.30 per transaction</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-muted-foreground">-৳84.66</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Final Payout */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 mb-6 border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Your Payout Amount</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ৳2,619.99
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>

            {/* Payout Schedule */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-5 mb-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Estimated Payout Date
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    <span className="font-semibold">Within 72 hours</span> • December 24, 2025
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your payout will be transferred to your registered bank account ending in ****4892
                  </p>
                </div>
              </div>
            </div>

            {/* Reassurance Message */}
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">🔒 Secure & Transparent:</span> All fees are clearly disclosed. 
                Your funds are processed securely through our verified payment partners.
              </p>
            </div>

            {/* CTA */}
            <Button 
              size="lg" 
              onClick={() => navigate('/project/outcome/next-steps')}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white font-semibold"
            >
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Questions about your payout? Contact our support team at support@dotfunding.com
          </p>
        </div>
      </div>
    </div>
  );
}
