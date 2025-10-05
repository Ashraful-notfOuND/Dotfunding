import {
  Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Mock data for demonstration
const regionData = [
  { region: "USA", backers: 450 },
  { region: "Europe", backers: 210 },
  { region: "Canada", backers: 85 },
  { region: "Asia", backers: 60 },
  { region: "Other", backers: 42 },
];

const rewardData = [
  { name: "Early Bird", value: 100, fill: "var(--color-a)" },
  { name: "Super Early Bird", value: 250, fill: "var(--color-b)" },
  { name: "Standard Package", value: 400, fill: "var(--color-c)" },
  { name: "Duo Pack", value: 97, fill: "var(--color-d)" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const StatisticsTab = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Backers by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="backers" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reward Tier Popularity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rewardData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {rewardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsTab;
