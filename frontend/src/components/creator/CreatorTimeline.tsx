import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2, 
  Circle, 
  XCircle, 
  Clock,
  AlertCircle,
  Plus,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'missed' | 'upcoming';
  isPublic: boolean;
  deliverables: Deliverable[];
  impact?: string; // What happens if delayed
}

export interface Deliverable {
  id: string;
  title: string;
  completed: boolean;
}

interface CreatorTimelineProps {
  projectId: string;
}

export function CreatorTimeline({ projectId }: CreatorTimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [projectId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/timeline`);
      
      if (response.ok) {
        const data = await response.json();
        setMilestones(data.milestones || []);
      } else {
        setMilestones(getMockMilestones());
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setMilestones(getMockMilestones());
    } finally {
      setLoading(false);
    }
  };

  const getMockMilestones = (): Milestone[] => [
    {
      id: '1',
      title: 'Product Design & Prototyping',
      description: 'Complete initial product design and create working prototype',
      dueDate: new Date(2025, 10, 15).toISOString(),
      status: 'completed',
      isPublic: true,
      deliverables: [
        { id: '1-1', title: '3D CAD models', completed: true },
        { id: '1-2', title: 'Material selection', completed: true },
        { id: '1-3', title: 'Working prototype', completed: true },
      ],
    },
    {
      id: '2',
      title: 'Beta Testing',
      description: 'Distribute prototypes to early backers for testing',
      dueDate: new Date(2025, 11, 25).toISOString(),
      status: 'in-progress',
      isPublic: true,
      deliverables: [
        { id: '2-1', title: 'Select beta testers', completed: true },
        { id: '2-2', title: 'Ship test units', completed: true },
        { id: '2-3', title: 'Collect feedback', completed: false },
        { id: '2-4', title: 'Iterate on design', completed: false },
      ],
      impact: 'Delays here will push back manufacturing by 2 weeks',
    },
    {
      id: '3',
      title: 'Manufacturing Setup',
      description: 'Finalize manufacturing partner and production line',
      dueDate: new Date(2026, 0, 10).toISOString(),
      status: 'upcoming',
      isPublic: false,
      deliverables: [
        { id: '3-1', title: 'Secure manufacturing partner', completed: false },
        { id: '3-2', title: 'Order materials', completed: false },
        { id: '3-3', title: 'Setup quality control', completed: false },
      ],
    },
    {
      id: '4',
      title: 'First Production Run',
      description: 'Begin mass production of final product',
      dueDate: new Date(2026, 1, 1).toISOString(),
      status: 'upcoming',
      isPublic: true,
      deliverables: [
        { id: '4-1', title: 'Start production', completed: false },
        { id: '4-2', title: 'Quality testing', completed: false },
        { id: '4-3', title: 'Packaging', completed: false },
      ],
    },
  ];

  const toggleDeliverable = (milestoneId: string, deliverableId: string) => {
    setMilestones(prev => prev.map(milestone => {
      if (milestone.id === milestoneId) {
        return {
          ...milestone,
          deliverables: milestone.deliverables.map(d =>
            d.id === deliverableId ? { ...d, completed: !d.completed } : d
          ),
        };
      }
      return milestone;
    }));
    // TODO: API call to update deliverable status
  };

  const getMilestoneIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-6 w-6 text-primary" />;
      case 'missed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'upcoming':
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getMilestoneColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-primary/20 bg-primary/5';
      case 'missed':
        return 'border-red-200 bg-red-50';
      case 'upcoming':
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: Milestone['status']) => {
    const variants: Record<Milestone['status'], any> = {
      completed: { variant: 'default' as const, className: 'bg-green-600' },
      'in-progress': { variant: 'default' as const, className: 'bg-primary' },
      missed: { variant: 'destructive' as const },
      upcoming: { variant: 'outline' as const },
    };
    
    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const getDaysUntil = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading timeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Timeline</h3>
          <p className="text-sm text-gray-600">Track your internal milestones and deliverables</p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const completedCount = milestone.deliverables.filter(d => d.completed).length;
          const totalCount = milestone.deliverables.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <Card key={milestone.id} className={getMilestoneColor(milestone.status)}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Timeline Icon */}
                  <div className="flex flex-col items-center">
                    {getMilestoneIcon(milestone.status)}
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                          {getStatusBadge(milestone.status)}
                          {!milestone.isPublic && (
                            <Badge variant="outline" className="text-xs">Internal Only</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(milestone.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                      {milestone.status !== 'completed' && (
                        <span className={milestone.status === 'missed' ? 'text-red-600 font-medium' : ''}>
                          {getDaysUntil(milestone.dueDate)}
                        </span>
                      )}
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-2 mb-3">
                      {milestone.deliverables.map(deliverable => (
                        <div key={deliverable.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={deliverable.completed}
                            onCheckedChange={() => toggleDeliverable(milestone.id, deliverable.id)}
                            disabled={milestone.status === 'completed'}
                          />
                          <span className={`text-sm ${deliverable.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {deliverable.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{completedCount}/{totalCount} completed</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            milestone.status === 'completed' ? 'bg-green-600' :
                            milestone.status === 'in-progress' ? 'bg-primary' :
                            milestone.status === 'missed' ? 'bg-red-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Impact Warning */}
                    {milestone.impact && milestone.status !== 'completed' && (
                      <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                        <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-orange-900">
                          <strong>Delay Impact:</strong> {milestone.impact}
                        </span>
                      </div>
                    )}
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
