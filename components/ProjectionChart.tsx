import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AreaChart as GraphIcon } from 'lucide-react';

interface ProjectionChartProps {
  data: Array<{
    month: string;
    value: number;
    income: number;
  }>;
  yearlyIncome: number;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ data, yearlyIncome }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-tg-card p-4 rounded-3xl border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-tg-text uppercase tracking-wider flex items-center gap-2">
          <GraphIcon size={14} /> Прогноз роста (1 год)
        </h3>
        <span className="text-xs font-bold text-tg-green">+{Math.floor(yearlyIncome).toLocaleString()} ₽</span>
      </div>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: '#17212b',
                borderColor: '#d4af37',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
              }}
              itemStyle={{ color: '#d4af37', fontSize: '14px' }}
              formatter={(value: number) => [`${value.toLocaleString()} ₽`, 'Капитал']}
              labelStyle={{ color: '#8b9bb4', fontSize: '14px' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#d4af37"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
