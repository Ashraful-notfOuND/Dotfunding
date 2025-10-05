import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-6 animate-fade-in">
          <CheckCircle className="h-24 w-24 text-success mx-auto" />
          <h1 className="text-4xl font-bold text-foreground">Pledge Successful!</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Thank you for your support! Your pledge has been successfully processed.
            You will receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/">Return to Homepage</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/profile">View Your Profile</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
