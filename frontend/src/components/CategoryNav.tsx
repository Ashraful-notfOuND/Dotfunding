import { Palette, Film, Gamepad2, Lightbulb, Music, Cpu, Grid3x3 } from "lucide-react";

interface CategoryNavProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { name: "All", icon: Grid3x3 },
  { name: "Technology", icon: Cpu },
  { name: "Art", icon: Palette },
  { name: "Games", icon: Gamepad2 },
  { name: "Design", icon: Lightbulb },
  { name: "Film", icon: Film },
  { name: "Music", icon: Music },
];

const CategoryNav = ({ selectedCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <nav className="sticky top-[73px] z-40 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.name;
            
            return (
              <button
                key={category.name}
                onClick={() => onCategoryChange(category.name)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-smooth
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
