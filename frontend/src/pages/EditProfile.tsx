import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const EditProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [bio, setBio] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      setName(user.name);
      setEmail(user.email);
      setProfilePic(user.profilePic || "");
      setBio(user.bio || "");
    }
  }, [isAuthenticated, navigate, user]);

  if (!isAuthenticated || !user) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!profilePic.trim()) newErrors.profilePic = "Profile picture is required.";
    if (!bio.trim()) newErrors.bio = "Bio is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = () => {
    if (!validateForm()) return;
    // Normally call API to save changes
    console.log("Saving changes:", { name, email, password, profilePic, bio });
    navigate("/profile");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePic">Profile Picture *</Label>
                <Input
                  id="profilePic"
                  placeholder="https://example.com/profile.jpg"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                />
                {errors.profilePic && <p className="text-red-600 text-sm">{errors.profilePic}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Input
                  id="bio"
                  placeholder="Write a short bio..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                {errors.bio && <p className="text-red-600 text-sm">{errors.bio}</p>}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
                <Button variant="outline" onClick={() => navigate("/profile")}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default EditProfile;
