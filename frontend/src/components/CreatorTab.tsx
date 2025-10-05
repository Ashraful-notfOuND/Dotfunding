import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for creator - in a real app, this would be passed as props
const creator = {
  name: "TechInnovate",
  avatar: "T",
  bio: "Hardware innovators creating the future of health technology. Based in San Francisco with a team of 15 engineers and designers.",
  location: "San Francisco, CA",
  projectsCreated: 12,
  totalBackers: 3542,
};

const CreatorTab = () => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl flex-shrink-0">
            {creator.avatar}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-2xl mb-1">{creator.name}</h3>
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
              <span className="inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {creator.location}
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">{creator.bio}</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">{creator.projectsCreated}</div>
              <div className="text-sm text-muted-foreground">Projects Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{creator.totalBackers}</div>
              <div className="text-sm text-muted-foreground">Total Backers</div>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => console.log("View profile")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorTab;
