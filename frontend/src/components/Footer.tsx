import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground">D</span>
              </div>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DotFunding
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering creators to bring their ideas to life through community support.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-secondary transition-smooth">
                <Twitter className="h-5 w-5 text-muted-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-secondary transition-smooth">
                <Github className="h-5 w-5 text-muted-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-secondary transition-smooth">
                <Linkedin className="h-5 w-5 text-muted-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-secondary transition-smooth">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/stats" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Stats
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/creator-handbook" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Creator Handbook
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/trust-safety" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Trust & Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DotFunding. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
