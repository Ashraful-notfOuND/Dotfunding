import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  TrendingDown, 
  MessageSquare, 
  Clock,
  RefreshCw,
  Target,
  XCircle
} from 'lucide-react';

export interface HealthAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  category: 'funding' | 'engagement' | 'timeline' | 'quality';
  title: string;
  message: string;
  actionable: boolean;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface ProjectHealthAlertsProps {
  projectId: string;
  onAlertClick?: (alert: HealthAlert) => void;
}

export function ProjectHealthAlerts({ projectId, onAlertClick }: ProjectHealthAlertsProps) {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthAlerts();
  }, [projectId]);

  const fetchHealthAlerts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/health`);
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      } else {
        // Mock data for demonstration
        setAlerts(getMockAlerts());
      }
    } catch (err) {
      console.error('Error fetching health alerts:', err);
      setAlerts(getMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  const getMockAlerts = (): HealthAlert[] => [
    {
      id: '1',
      type: 'warning',
      category: 'funding',
      title: 'Funding Slowing Down',
      message: 'Pledges decreased by 12% this week compared to last week. Consider updating your project or engaging with backers.',
      actionable: true,
      severity: 'medium',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'danger',
      category: 'engagement',
      title: 'Unanswered Backer Questions',
      message: 'You have 3 unanswered questions in the Community tab. Responding promptly builds trust.',
      actionable: true,
      severity: 'high',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'funding':
        return <TrendingDown className="h-5 w-5" />;
      case 'engagement':
        return <MessageSquare className="h-5 w-5" />;
      case 'timeline':
        return <Clock className="h-5 w-5" />;
      case 'quality':
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertStyles = (type: HealthAlert['type']) => {
    switch (type) {
      case 'danger':
        return {
          border: 'border-border',
          bg: 'bg-card',
          iconBg: 'bg-primary',
          textColor: 'text-foreground',
          badgeVariant: 'destructive' as const,
        };
      case 'warning':
        return {
          border: 'border-border',
          bg: 'bg-card',
          iconBg: 'bg-primary',
          textColor: 'text-foreground',
          badgeVariant: 'secondary' as const,
        };
      case 'info':
        return {
          border: 'border-border',
          bg: 'bg-card',
          iconBg: 'bg-primary',
          textColor: 'text-foreground',
          badgeVariant: 'outline' as const,
        };
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return '';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-white p-2 rounded-full">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900">All Good!</h4>
              <p className="text-sm text-green-800">
                No health issues detected for your project.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Project Health Alerts
        </h3>
        <Badge variant="outline">{alerts.length} active</Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const styles = getAlertStyles(alert.type);
          
          return (
            <Card 
              key={alert.id} 
              className={`${styles.border} ${styles.bg} transition-all hover:shadow-md ${
                alert.actionable ? 'cursor-pointer' : ''
              }`}
              onClick={() => alert.actionable && onAlertClick?.(alert)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`${styles.iconBg} text-white p-2 rounded-lg flex-shrink-0`}>
                    {getAlertIcon(alert.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-semibold ${styles.textColor}`}>
                        {alert.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {alert.severity !== 'low' && (
                          <Badge variant={styles.badgeVariant} className="text-xs">
                            {getSeverityLabel(alert.severity)}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
