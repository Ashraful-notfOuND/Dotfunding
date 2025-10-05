import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

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
      
      toast({
        title: prev.includes(projectId) ? "Removed from wishlist" : "Added to wishlist",
        description: projectTitle ? `${projectTitle}` : undefined,
      });
      
      return newWishlist;
    });
  };

  const isInWishlist = (projectId: string) => wishlist.includes(projectId);

  return { wishlist, toggleWishlist, isInWishlist };
};
