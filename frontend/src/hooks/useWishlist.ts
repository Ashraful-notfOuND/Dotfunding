import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const toggleWishlist = (projectId: string, projectTitle?: string) => {
    setWishlist((prev) => {
      const newWishlist = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      
      if (!prev.includes(projectId)) {
        toast("Project saved!", {
          description: "You can view all your saved projects on your profile.",
          action: {
            label: "View Profile",
            onClick: () => window.location.href = "/profile",
          },
        });
      }
      
      return newWishlist;
    });
  };

  const isInWishlist = (projectId: string) => wishlist.includes(projectId);

  return { wishlist, toggleWishlist, isInWishlist };
};
