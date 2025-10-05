interface SubCategoryNavProps {
  selectedCategory: string;
  selectedSubCategory: string;
  onSubCategoryChange: (subCategory: string) => void;
}

const subCategories: Record<string, string[]> = {
  All: ["All"],
  Technology: ["All", "Wearables", "Smart Home", "Gadgets", "Software", "Hardware"],
  Art: ["All", "Books", "Sculpture", "Painting", "Photography", "Illustration"],
  Games: ["All", "Board Games", "Video Games", "Card Games", "Tabletop RPG"],
  Design: ["All", "Home & Living", "Tableware", "Furniture", "Fashion", "Accessories"],
  Film: ["All", "Documentary", "Animation", "Narrative", "Short Film", "Web Series"],
  Music: ["All", "Albums", "Events", "Music Videos", "Instruments", "Recording"],
};

const SubCategoryNav = ({
  selectedCategory,
  selectedSubCategory,
  onSubCategoryChange,
}: SubCategoryNavProps) => {
  const currentSubCategories = subCategories[selectedCategory] || ["All"];

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
        Sub-Categories
      </h3>
      <nav className="space-y-1">
        {currentSubCategories.map((subCategory) => {
          const isActive = selectedSubCategory === subCategory;
          
          return (
            <button
              key={subCategory}
              onClick={() => onSubCategoryChange(subCategory)}
              className={`
                w-full text-left px-3 py-2 rounded-md transition-smooth text-sm
                ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-secondary"
                }
              `}
            >
              {subCategory}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SubCategoryNav;
