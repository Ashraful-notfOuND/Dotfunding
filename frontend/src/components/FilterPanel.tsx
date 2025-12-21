import { TrendingUp, Rocket, Target, Star, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterPanelProps {
  selectedFilters: string[];
  onFilterToggle: (filter: string) => void;
  sortOption: string;
  onSortChange: (value: string) => void;
  fundingGoalRange: number[];
  onFundingGoalChange: (value: number[]) => void;
  selectedSubCategories: string[];
  onSubCategoryToggle: (subCategory: string) => void;
}

const filterGroups = [
  {
    title: "Status & Progress",
    filters: [
      { id: "trending", label: "Trending", icon: TrendingUp },
      { id: "just-launched", label: "Just Launched", icon: Rocket },
      { id: "nearly-funded", label: "Nearly Funded", icon: Target },
    ],
  },
  {
    title: "Curation",
    filters: [{ id: "staff-picks", label: "Staff Picks", icon: Star }],
  },
  {
    title: "Location",
    filters: [{ id: "near-you", label: "Projects Near You", icon: MapPin }],
  },
];

const subCategories = [
    { id: "Wearables", label: "Wearables" },
    { id: "Books", label: "Books" },
    { id: "Board Games", label: "Board Games" },
    { id: "Video Games", label: "Video Games" },
    { id: "Animation", label: "Animation" },
    { id: "Smart Home", label: "Smart Home" },
];

const FilterPanel = ({
  selectedFilters,
  onFilterToggle,
  sortOption,
  onSortChange,
  fundingGoalRange,
  onFundingGoalChange,
  selectedSubCategories,
  onSubCategoryToggle,
}: FilterPanelProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-8">
      <div>
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          Sort by
        </h3>
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="funding">Funding</SelectItem>
            <SelectItem value="end-date">End Date</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          Filters
        </h3>
        <div className="space-y-4">
          {filterGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{group.title}</h4>
              <div className="flex flex-wrap gap-2">
                {group.filters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = selectedFilters.includes(filter.id);
                  
                  return (
                    <button
                      key={filter.id}
                      onClick={() => onFilterToggle(filter.id)}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-smooth border
                        ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary/50"
                        }
                      `}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          Funding Goal
        </h3>
        <Slider
          defaultValue={[5000]}
          value={fundingGoalRange}
          onValueChange={onFundingGoalChange}
          min={0}
          max={5000}
          step={50}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Up to ৳{fundingGoalRange[0].toLocaleString()}
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          Sub-Categories
        </h3>
        <div className="space-y-2">
            {subCategories.map((sub) => (
                <div key={sub.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={sub.id}
                        checked={selectedSubCategories.includes(sub.id)}
                        onCheckedChange={() => onSubCategoryToggle(sub.id)}
                    />
                    <Label htmlFor={sub.id}>{sub.label}</Label>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;