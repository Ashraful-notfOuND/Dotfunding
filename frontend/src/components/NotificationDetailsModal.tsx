import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, DollarSign, MessageSquare, Gift, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    id: string;
    message: string;
    created_at: string;
    type?: string;
    metadata?: {
      projectId?: string;
      projectTitle?: string;
      donorName?: string;
      donorId?: string;
      amount?: number;
      isAnonymous?: boolean;
      donationDate?: string;
      paymentMethod?: string;
      transactionId?: string;
      donorMessage?: string;
      rewardTier?: string;
    };
  } | null;
}

const NotificationDetailsModal = ({
  isOpen,
  onClose,
  notification,
}: NotificationDetailsModalProps) => {
  const navigate = useNavigate();
  const [donorDetails, setDonorDetails] = useState<any>(null);

  useEffect(() => {
    if (notification?.metadata?.donorId && !notification.metadata.isAnonymous) {
      // Fetch donor details if available
      fetchDonorDetails(notification.metadata.donorId);
    }
  }, [notification]);

  const fetchDonorDetails = async (donorId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${donorId}`);
      if (response.ok) {
        const data = await response.json();
        setDonorDetails(data.user || data);
      }
    } catch (error) {
      console.error('Failed to fetch donor details:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleViewProject = () => {
    if (notification?.metadata?.projectId) {
      navigate(`/project/${notification.metadata.projectId}`);
      onClose();
    }
  };

  const handleViewDonor = () => {
    if (notification?.metadata?.donorId && !notification.metadata.isAnonymous) {
      navigate(`/creator/${notification.metadata.donorId}`);
      onClose();
    }
  };

  if (!notification) return null;

  const { metadata } = notification;
  const isAnonymous = metadata?.isAnonymous ?? false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Donation Received
          </DialogTitle>
          <DialogDescription>
            {formatDate(notification.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Amount Section */}
          {metadata?.amount && (
            <div className="bg-primary/10 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-6 h-6 text-primary" />
                <span className="text-sm text-muted-foreground">Amount Received</span>
              </div>
              <p className="text-4xl font-bold text-primary">
                {formatAmount(metadata.amount)}
              </p>
            </div>
          )}

          <Separator />

          {/* Donor Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Donor Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              {isAnonymous ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="w-4 h-4" />
                  <span>Anonymous Donor</span>
                  <Badge variant="secondary">Private</Badge>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {metadata?.donorName || donorDetails?.name || 'Generous Backer'}
                      </span>
                    </div>
                    {metadata?.donorId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewDonor}
                      >
                        View Profile
                      </Button>
                    )}
                  </div>
                  {(metadata?.donorEmail || donorDetails?.email) && (
                    <div className="text-sm text-muted-foreground">
                      📧 {metadata?.donorEmail || donorDetails.email}
                    </div>
                  )}
                  {donorDetails?.location && (
                    <div className="text-sm text-muted-foreground">
                      📍 {donorDetails.location}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Project Information */}
          {metadata?.projectTitle && (
            <div className="space-y-3">
              <h3 className="font-semibold">Project</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{metadata.projectTitle}</p>
                  {metadata.projectId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewProject}
                    >
                      View Project
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reward Tier */}
          {metadata?.rewardTier && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Reward Tier
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <Badge variant="secondary">{metadata.rewardTier}</Badge>
                </div>
              </div>
            </>
          )}

          {/* Donor Message */}
          {metadata?.donorMessage && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message from Donor
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm italic">"{metadata.donorMessage}"</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Payment Details */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Transaction Details
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {formatDate(metadata?.donationDate || notification.created_at)}
                </span>
              </div>
              {metadata?.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{metadata.paymentMethod}</span>
                </div>
              )}
              {metadata?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-xs">{metadata.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-center">
              💚 Thank you for creating amazing projects! Your supporters believe in your vision.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {metadata?.projectId && (
            <Button onClick={handleViewProject} className="flex-1">
              View Project
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailsModal;
