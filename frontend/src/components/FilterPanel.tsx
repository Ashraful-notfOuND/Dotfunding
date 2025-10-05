import { TrendingUp, Rocket, Target, Star, MapPin } from "lucide-react";

interface FilterPanelProps {
  selectedFilters: string[];
  onFilterToggle: (filter: string) => void;
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

const FilterPanel = ({ selectedFilters, onFilterToggle }: FilterPanelProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
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
  );
};

export default FilterPanel;
