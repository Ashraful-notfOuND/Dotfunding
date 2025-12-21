import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { ProjectAnalytics } from './ProjectAnalytics';
import { ProjectHealthAlerts, HealthAlert } from './ProjectHealthAlerts';
import { ProjectBackers } from '../ProjectBackers';
import { MilestoneProgress } from './MilestoneProgress';

interface CreatorDashboardProps {
  projectId: string;
  creatorId: string;
  projectTitle: string;
}

/**
 * Creator-only dashboard - appears ABOVE the standard project view
 * Provides management tools, analytics, and accountability signals
 */
export function CreatorDashboard({ projectId, creatorId, projectTitle }: CreatorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const navigate = useNavigate();

  const handleAlertClick = (alert: HealthAlert) => {
    // Navigate to relevant tab based on alert category
    switch (alert.category) {
      case 'engagement':
        // Close analytics and scroll to community section
        window.location.hash = '#community';
        break;
      case 'funding':
        // Switch to analytics tab to see funding trends
        setActiveTab('analytics');
        break;
      case 'timeline':
        // Navigate to timeline page
        navigate(`/project/${projectId}/timeline`);
        break;
      default:
        console.log('Alert clicked:', alert);
    }
  };

  return (
    <div className="border-2 border-primary/20 rounded-lg mb-8 bg-card">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary to-accent text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Creator Analytics</CardTitle>
                <p className="text-sm text-white/90 mt-1">
                  Manage and monitor "{projectTitle}"
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Analytics View
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Responsibility Signals - Always Visible */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResponsibilityCard
              icon={<AlertCircle className="h-5 w-5" />}
              label="Unanswered Questions"
              value="3"
              variant="warning"
              onClick={() => setActiveTab('overview')}
            />
            <ResponsibilityCard
              icon={<Clock className="h-5 w-5" />}
              label="Project Timeline"
              value="View"
              variant="info"
              onClick={() => navigate(`/project/${projectId}/timeline`)}
            />
            <ResponsibilityCard
              icon={<CheckCircle className="h-5 w-5" />}
              label="Funding This Week"
              value="-12%"
              variant="warning"
              onClick={() => setActiveTab('analytics')}
            />
          </div>

          {/* Tabbed Dashboard Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="milestones" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="backers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Backers
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Health Alerts */}
            <TabsContent value="overview" className="space-y-6">
              <ProjectHealthAlerts 
                projectId={projectId} 
                onAlertClick={handleAlertClick}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <ProjectAnalytics projectId={projectId} />
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones">
              <MilestoneProgress projectId={projectId} />
            </TabsContent>

            {/* Backers Tab - Moved from main project tabs */}
            <TabsContent value="backers">
              <ProjectBackers 
                projectId={projectId} 
                creatorId={creatorId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface ResponsibilityCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant: 'warning' | 'info' | 'success';
  onClick?: () => void;
}

function ResponsibilityCard({ icon, label, value, variant, onClick }: ResponsibilityCardProps) {
  const styles = {
    warning: {
      bg: 'bg-card',
      border: 'border-border',
      iconBg: 'bg-primary',
      textColor: 'text-foreground',
    },
    info: {
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      iconBg: 'bg-primary',
      textColor: 'text-primary',
    },
    success: {
      bg: 'bg-card',
      border: 'border-border',
      iconBg: 'bg-primary',
      textColor: 'text-foreground',
    },
  };

  const style = styles[variant];

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`${style.iconBg} text-white p-2 rounded-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${style.textColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
