import React from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';

/**
 * Mini Line Chart Component for displaying violation trends
 */
export function MiniLineChart({ title, data }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <LineChartIcon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="brudd" stroke="#2563eb" strokeWidth={2} dot={false} />
          </ReLineChart>
        </ResponsiveContainer>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          x: måned (YYYY-MM) · y: brudd
        </div>
      </CardContent>
    </Card>
  );
}