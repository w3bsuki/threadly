'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Segment {
  name: string;
  count: number;
  percentage: number;
  avgSpend: number;
  color: string;
}

interface CustomerSegmentChartProps {
  segments: Segment[];
}

export function CustomerSegmentChart({ segments }: CustomerSegmentChartProps) {
  const data = segments.map(segment => ({
    name: segment.name,
    value: segment.count,
    percentage: segment.percentage,
    avgSpend: segment.avgSpend,
    color: segment.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div>Customers: {data.value}</div>
            <div>Percentage: {data.percentage.toFixed(1)}%</div>
            <div>Avg Spend: ${data.avgSpend.toFixed(0)}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}