"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PipelineChartProps = {
  title: string;
  description: string;
  data: Array<{
    name: string;
    score: number;
  }>;
};

export function PipelineChart({
  title,
  description,
  data
}: PipelineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "var(--r-xl)",
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                boxShadow: "0 20px 45px rgba(0,0,0,0.4)"
              }}
            />
            <Bar dataKey="score" radius={[10, 10, 0, 0]} fill="var(--green)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
