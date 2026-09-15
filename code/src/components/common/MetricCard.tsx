import type { ReactNode } from 'react';
interface MetricCardProps { title: string; value: string | number; icon: ReactNode; subtitle?: string; trend?: { value: string; positive?: boolean }; colorScheme?: 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo'; }
export const MetricCard = ({ title, value, subtitle, trend }: MetricCardProps) => <div className="metric-editorial"><p>{title}</p><strong>{typeof value === 'number' ? String(value).padStart(2, '0') : value}</strong>{subtitle && <span>{subtitle}</span>}{trend && <span>{trend.value}</span>}</div>;
