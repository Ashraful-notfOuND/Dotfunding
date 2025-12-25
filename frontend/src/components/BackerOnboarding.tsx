import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Star, CheckCircle2, Users, FileText, Download } from 'lucide-react';

interface BackerOnboardingProps {
  open: boolean;
  onClose: () => void;
  projectTitle: string;
  transactionId?: string;
  onGoToCommunity?: () => void;
  onGoToReviews?: () => void;
}

export function BackerOnboarding({ 
  open, 
  onClose, 
  projectTitle,
  transactionId,
  onGoToCommunity,
  onGoToReviews 
}: BackerOnboardingProps) {
  const [step, setStep] = useState(0);

  const handleDownloadReceipt = async () => {
    if (!transactionId) {
      alert('Transaction ID not available');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Transaction fetch failed:', response.status, errorData);
        
        if (response.status === 503) {
          alert('Transaction logging is not fully set up yet. You can access your receipt later from your profile once setup is complete.');
          return;
        }
        
        if (response.status === 404) {
          alert('Receipt is being generated. Please access it from your Profile → Backed Projects in a few moments.');
          return;
        }
        
        throw new Error('Failed to fetch transaction');
      }
      
      const data = await response.json();
      console.log('Transaction data:', data);
      const receiptUrl = data.transaction?.receipt_pdf_url;
      
      if (receiptUrl) {
        console.log('Opening receipt:', receiptUrl);
        window.open(receiptUrl, '_blank');
      } else {
        console.warn('No receipt URL found in transaction data');
        alert('Receipt is being generated. You can access it from Profile → Backed Projects in a few moments.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Receipt will be available shortly. Access it from Profile → Backed Projects.');
    }
  };

  useEffect(() => {
    if (open) {
      setStep(0);
    }
  }, [open]);

  const steps = [
    {
      title: '🎉 Thank You for Your Support!',
      description: `You're now a backer of "${projectTitle}"`,
      icon: <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your contribution helps bring this project to life. As a backer, you now have access to exclusive features!
          </p>
        </div>
      ),
    },
    {
      title: '💬 Join the Community',
      description: 'Connect with other backers and the creator',
      icon: <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />,
      content: (
        <Card className="border-blue-200">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold">Discussion Posts</h4>
                <p className="text-sm text-muted-foreground">
                  Create posts, ask questions, and share ideas with fellow backers
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold">Polls & Voting</h4>
                <p className="text-sm text-muted-foreground">
                  Participate in polls and help shape project decisions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold">Direct Communication</h4>
                <p className="text-sm text-muted-foreground">
                  Engage directly with the project creator and other supporters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      action: onGoToCommunity,
      actionLabel: 'Go to Community',
    },
    {
      title: '⭐ Share Your Experience',
      description: 'Help others discover this project',
      icon: <Star className="h-16 w-16 text-yellow-500 mx-auto mb-4" />,
      content: (
        <Card className="border-yellow-200">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-semibold">Leave a Review</h4>
                <p className="text-sm text-muted-foreground">
                  Share your thoughts and rate your experience with this project
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-semibold">Help the Creator</h4>
                <p className="text-sm text-muted-foreground">
                  Your honest feedback helps improve the project and builds trust
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-semibold">Guide Other Backers</h4>
                <p className="text-sm text-muted-foreground">
                  Your review helps potential backers make informed decisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      action: onGoToReviews,
      actionLabel: 'Write a Review',
    },
    {
      title: '📄 Your Transaction Receipt',
      description: 'Download your payment receipt',
      icon: <FileText className="h-16 w-16 text-purple-500 mx-auto mb-4" />,
      content: (
        <Card className="border-purple-200">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-3">
              <div className="flex items-start gap-3 text-left">
                <FileText className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <h4 className="font-semibold">PDF Receipt Available</h4>
                  <p className="text-sm text-muted-foreground">
                    Your transaction receipt has been generated and is ready to download
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Download className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Access Anytime</h4>
                  <p className="text-sm text-muted-foreground">
                    You can also download this receipt later from your profile's Backed Projects section
                  </p>
                </div>
              </div>
            </div>
            {transactionId && (
              <Button
                onClick={handleDownloadReceipt}
                className="w-full mt-4"
                variant="default"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Receipt Now
              </Button>
            )}
          </CardContent>
        </Card>
      ),
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleAction = () => {
    if (currentStep.action) {
      currentStep.action();
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="mb-4">
            {currentStep.icon}
          </div>
          <DialogTitle className="text-2xl text-center">
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep.content}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep.action && (
              <Button
                variant="outline"
                onClick={handleAction}
              >
                {currentStep.actionLabel}
              </Button>
            )}
            <Button onClick={handleNext}>
              {step < steps.length - 1 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
