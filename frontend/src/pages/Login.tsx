import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import defaultAvatar from "@/assets/default-avatar.png";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  // Redirect if already logged in
  // Use useEffect to avoid navigation during render
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      toast({
        title: "Login successful!",
        description: `Welcome back, ${data.user.full_name}`,
      });
      // set auth state in client
      // data.user should contain at least { email, full_name }
      setAuth({
          id: data.user.id, 
          email: data.user.email,
          name: data.user.full_name,
          bio: data.user.bio || "",
          profilePic: data.user.profile_pic || defaultAvatar,
          location: data.user.location || "Not specified",
        });
        console.log("User logged in: ", data.user.id);
      // Redirect to original page or home
      navigate(from);
    } else {
      toast({
        title: "Login failed",
        description: data.error,
        variant: "destructive",
      });
    }
  } catch (err) {
    console.error(err);
    toast({
      title: "Server error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-background p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="space-y-1 text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">D</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DotFunding
            </span>
          </Link>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
