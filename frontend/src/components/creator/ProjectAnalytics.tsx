import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
  Share2
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  activeBackers: number;
  inactiveBackers: number;
  fundingTrend: Array<{ date: string; amount: number }>;
  trafficSources: Array<{ source: string; percentage: number }>;
  weeklyGrowth: number;
}

interface ProjectAnalyticsProps {
  projectId: string;
}

export function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [projectId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/analytics`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Analytics data received:', data);
        setAnalytics(data);
      } else {
        console.error('Analytics API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        // Still set empty data rather than mock
        setAnalytics({
          totalViews: 0,
          uniqueVisitors: 0,
          conversionRate: 0,
          activeBackers: 0,
          inactiveBackers: 0,
          weeklyGrowth: 0,
          fundingTrend: [],
          trafficSources: []
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Set empty data on error
      setAnalytics({
        totalViews: 0,
        uniqueVisitors: 0,
        conversionRate: 0,
        activeBackers: 0,
        inactiveBackers: 0,
        weeklyGrowth: 0,
        fundingTrend: [],
        trafficSources: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalytics = (): AnalyticsData => ({
    totalViews: 1247,
    uniqueVisitors: 892,
    conversionRate: 12.5,
    activeBackers: 45,
    inactiveBackers: 3,
    weeklyGrowth: 8.3,
    fundingTrend: [
      { date: 'Dec 14', amount: 1200 },
      { date: 'Dec 15', amount: 2100 },
      { date: 'Dec 16', amount: 3400 },
      { date: 'Dec 17', amount: 4200 },
      { date: 'Dec 18', amount: 5800 },
      { date: 'Dec 19', amount: 7100 },
      { date: 'Dec 20', amount: 8500 },
    ],
    trafficSources: [
      { source: 'Direct', percentage: 45 },
      { source: 'Social Media', percentage: 30 },
      { source: 'Search', percentage: 15 },
      { source: 'Referral', percentage: 10 },
    ],
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          trend={analytics.weeklyGrowth}
          trendLabel="vs last week"
        />
        <MetricCard
          title="Unique Visitors"
          value={analytics.uniqueVisitors.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          trend={analytics.weeklyGrowth - 2}
          trendLabel="vs last week"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          icon={<MousePointerClick className="h-5 w-5" />}
          trend={2.1}
          trendLabel="vs average"
        />
        <MetricCard
          title="Active Backers"
          value={analytics.activeBackers.toString()}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle={`${analytics.inactiveBackers} inactive`}
        />
      </div>

      {/* Funding Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.fundingTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  stroke="#888"
                />
                <YAxis 
                  className="text-xs"
                  stroke="#888"
                  tickFormatter={(value) => `৳${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value) => [`৳${value}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Traffic Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.trafficSources.map((source, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{source.source}</span>
                  <span className="text-sm text-gray-600">{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-white p-2 rounded-full">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Performance Insight</h4>
              <p className="text-sm text-muted-foreground">
                Your project is performing {analytics.weeklyGrowth > 5 ? 'above' : 'at'} average 
                with a {analytics.conversionRate}% conversion rate. 
                {analytics.weeklyGrowth > 5 && ' Keep up the momentum!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
}

function MetricCard({ title, value, icon, trend, trendLabel, subtitle }: MetricCardProps) {
  const isPositive = trend && trend > 0;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span className="text-xs font-medium">
                  {Math.abs(trend)}% {trendLabel}
                </span>
              </div>
            )}
          </div>
          <div className="text-primary bg-primary/10 p-2 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
