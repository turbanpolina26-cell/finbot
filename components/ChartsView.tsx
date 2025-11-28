import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
}

const COLORS = ['#5288c1', '#ef5b5b', '#e0a800', '#4caf50', '#9c27b0', '#00bcd4', '#795548'];

export const ChartsView: React.FC<Props> = ({ transactions }) => {
  // Aggregate data for Pie Chart (Expenses by Category)
  const expenseData = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  // Aggregate data for Bar Chart (Last 7 days spending)
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
      fullDate: dateStr,
      amount: 0
    };
  }).reverse();

  transactions.forEach(t => {
    if (t.type === TransactionType.EXPENSE) {
      const tDate = t.date.split('T')[0];
      const dayData = last7DaysData.find(d => d.fullDate === tDate);
      if (dayData) {
        dayData.amount += t.amount;
      }
    }
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Spending Breakdown */}
      <div className="bg-tg-secondary p-4 rounded-2xl">
        <h3 className="text-tg-hint text-sm uppercase tracking-wider mb-4 font-semibold">Расходы по категориям</h3>
        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#17212b', borderColor: '#2b3949', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => `${value.toLocaleString()} ₽`}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="text-2xl font-bold text-tg-text">
                {expenseData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </span>
              <p className="text-xs text-tg-hint">Всего (₽)</p>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
            {expenseData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs text-tg-text">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="flex-1 truncate">{entry.name}</span>
                    <span className="font-medium text-tg-hint">{Math.round((entry.value / expenseData.reduce((s, i) => s + i.value, 0)) * 100)}%</span>
                </div>
            ))}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-tg-secondary p-4 rounded-2xl">
        <h3 className="text-tg-hint text-sm uppercase tracking-wider mb-4 font-semibold">Динамика (7 дней)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#7c8b9d', fontSize: 12 }} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#17212b', borderColor: '#2b3949', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => [`${value} ₽`, 'Потрачено']}
              />
              <Bar dataKey="amount" fill="#5288c1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};