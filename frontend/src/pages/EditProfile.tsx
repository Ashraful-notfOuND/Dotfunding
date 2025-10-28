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
  const { user, isAuthenticated, setAuth } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setProfilePicPreview(user.profilePic || "");
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    if (profilePicFile) {
      const objectUrl = URL.createObjectURL(profilePicFile);
      setProfilePicPreview(objectUrl);

      // Clean up the URL object when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [profilePicFile]);

  if (!isAuthenticated || !user) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!bio.trim()) newErrors.bio = "Bio is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!profilePicFile && !profilePicPreview) newErrors.profilePic = "Profile picture is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", user.id); // user UUID
      formData.append("full_name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("bio", bio);
      formData.append("location", location);

      if (profilePicFile) {
        formData.append("profilePic", profilePicFile);
      }

      const res = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Profile updated successfully!");
        setAuth({
          ...user,
          name: data.user.full_name,
          email: data.user.email,
          bio: data.user.bio,
          location: data.user.location,
          profilePic: data.user.profile_pic,
        });
        console.log("Updated user:", data.user);
        navigate("/profile");
      } else {
        console.error("❌ Update failed:", data);
        alert(data.error || "Profile update failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while updating your profile.");
    } finally {
      setLoading(false);
    }
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

              {/* Profile picture upload with preview */}
              <div className="space-y-2">
                <Label htmlFor="profilePicFile">Upload Profile Picture *</Label>
                <Input
                  id="profilePicFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)}
                />
                {errors.profilePic && (
                  <p className="text-red-600 text-sm">{errors.profilePic}</p>
                )}
                {profilePicPreview && (
                  <img
                    src={profilePicPreview}
                    alt="Profile Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-full border"
                  />
                )}
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

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Your City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {errors.location && <p className="text-red-600 text-sm">{errors.location}</p>}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSaveChanges} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/profile")}>
                  Cancel
                </Button>
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
