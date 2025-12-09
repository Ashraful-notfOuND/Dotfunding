import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
              <p className="text-muted-foreground mt-2">Last updated: December 9, 2025</p>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using DotFunding, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you create an account with us, you must provide accurate, complete, and current information. 
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account and password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Ensuring your account information is accurate and up-to-date</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Project Creation</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  As a project creator, you agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide accurate and truthful information about your project</li>
                  <li>Fulfill all rewards and obligations to backers</li>
                  <li>Use funds only for the stated project purpose</li>
                  <li>Keep backers informed about project progress</li>
                  <li>Not engage in fraudulent or misleading activities</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Backing Projects</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  As a backer, you understand that:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Backing a project is not a purchase but a pledge to support</li>
                  <li>Project creators are responsible for completing their projects</li>
                  <li>There are no guarantees that projects will be completed</li>
                  <li>Refunds are at the discretion of project creators</li>
                  <li>You should research projects before backing them</li>
                  <li>All pledges are final once processed</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Payments and Fees</h2>
                <p className="text-muted-foreground leading-relaxed">
                  DotFunding charges a platform fee on successfully funded projects. Payment processing fees may apply. 
                  All financial transactions are processed through secure third-party payment providers. 
                  You are responsible for any taxes on your pledges or project funds.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Project creators retain ownership of their intellectual property. By posting a project, 
                  you grant DotFunding a license to display and promote your content on our platform. 
                  You must have the right to use any content you post.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Prohibited Activities</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You may not use our platform to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Post offensive, harmful, or inappropriate content</li>
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on others' intellectual property rights</li>
                  <li>Spam or harass other users</li>
                  <li>Attempt to manipulate the platform or its systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Dispute Resolution</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Disputes between backers and creators should be resolved directly between the parties. 
                  DotFunding may provide assistance but is not responsible for resolving disputes. 
                  We reserve the right to suspend or terminate accounts involved in disputes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  DotFunding is not liable for any damages arising from your use of the platform, 
                  including but not limited to project failures, unfulfilled rewards, or financial losses. 
                  We provide the platform "as is" without warranties of any kind.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy is important to us. We collect and use your personal information in accordance with 
                  our Privacy Policy. By using DotFunding, you consent to our collection and use of your data as described.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes. 
                  Your continued use of the platform after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">12. Account Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in 
                  prohibited activities. You may close your account at any time by contacting support.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">13. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about these Terms and Conditions, please contact us at:
                </p>
                <div className="mt-3 p-4 bg-muted rounded-lg">
                  <p className="font-medium">DotFunding Support</p>
                  <p className="text-muted-foreground">Email: support@dotfunding.com</p>
                  <p className="text-muted-foreground">Address: [Your Address]</p>
                </div>
              </section>

              <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  By creating an account, backing a project, or using any feature of DotFunding, 
                  you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button asChild>
              <Link to="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
