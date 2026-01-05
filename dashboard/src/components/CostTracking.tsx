import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CostTracking as CostData } from '../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import './CostTracking.css';

function CostTracking() {
  const [costData, setCostData] = useState<CostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthData, setCurrentMonthData] = useState<CostData | null>(null);

  useEffect(() => {
    loadCostData();
  }, []);

  const loadCostData = async () => {
    try {
      const { data, error } = await supabase
        .from('cost_tracking')
        .select('*')
        .order('month', { ascending: true });

      if (error) throw error;

      if (data) {
        setCostData(data);

        const currentMonth = new Date().toISOString().slice(0, 7);
        const current = data.find((d) => d.month === currentMonth);
        setCurrentMonthData(current || null);
      }
    } catch (error) {
      console.error('Error loading cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = costData.reduce((sum, d) => sum + d.total_cost, 0);
  const totalTokens =
    costData.reduce((sum, d) => sum + d.input_tokens + d.output_tokens, 0);
  const currentBudget = currentMonthData?.monthly_budget || 100;
  const currentSpent = currentMonthData?.total_cost || 0;
  const budgetRemaining = currentBudget - currentSpent;
  const budgetUsedPercent = (currentSpent / currentBudget) * 100;

  const chartData = costData.map((d) => ({
    month: d.month,
    cost: Number(d.total_cost.toFixed(2)),
    budget: Number(d.monthly_budget),
    inputTokens: Number((d.input_tokens / 1000).toFixed(1)),
    outputTokens: Number((d.output_tokens / 1000).toFixed(1)),
  }));

  if (loading) {
    return (
      <div className="cost-tracking">
        <div className="loading">Loading cost data...</div>
      </div>
    );
  }

  return (
    <div className="cost-tracking">
      <div className="cost-header">
        <h1>Cost Tracking</h1>
        <p>OpenAI API usage and expenditure</p>
      </div>

      <div className="cost-summary">
        <div className="cost-card highlight">
          <div className="cost-card-header">
            <div className="cost-icon">
              <DollarSign size={24} />
            </div>
            <div className="cost-status">
              {budgetUsedPercent < 80 ? (
                <CheckCircle size={20} color="#10b981" />
              ) : (
                <AlertCircle size={20} color="#f59e0b" />
              )}
            </div>
          </div>
          <div className="cost-content">
            <div className="cost-label">Current Month</div>
            <div className="cost-value">${currentSpent.toFixed(2)}</div>
            <div className="cost-budget">
              of ${currentBudget.toFixed(2)} budget
            </div>
            <div className="budget-bar">
              <div
                className="budget-fill"
                style={{
                  width: `${Math.min(budgetUsedPercent, 100)}%`,
                  background:
                    budgetUsedPercent >= 90
                      ? '#ef4444'
                      : budgetUsedPercent >= 80
                      ? '#f59e0b'
                      : '#10b981',
                }}
              />
            </div>
            <div className="budget-percent">{budgetUsedPercent.toFixed(1)}% used</div>
          </div>
        </div>

        <div className="cost-card">
          <div className="cost-icon">
            <TrendingUp size={24} />
          </div>
          <div className="cost-content">
            <div className="cost-label">Total Spent</div>
            <div className="cost-value">${totalSpent.toFixed(2)}</div>
            <div className="cost-detail">{costData.length} months tracked</div>
          </div>
        </div>

        <div className="cost-card">
          <div className="cost-icon">
            <TrendingUp size={24} />
          </div>
          <div className="cost-content">
            <div className="cost-label">Budget Remaining</div>
            <div
              className="cost-value"
              style={{
                color:
                  budgetRemaining < currentBudget * 0.2
                    ? '#ef4444'
                    : budgetRemaining < currentBudget * 0.5
                    ? '#f59e0b'
                    : '#10b981',
              }}
            >
              ${budgetRemaining.toFixed(2)}
            </div>
            <div className="cost-detail">this month</div>
          </div>
        </div>

        <div className="cost-card">
          <div className="cost-icon">
            <TrendingUp size={24} />
          </div>
          <div className="cost-content">
            <div className="cost-label">Total Tokens</div>
            <div className="cost-value">
              {(totalTokens / 1000000).toFixed(2)}M
            </div>
            <div className="cost-detail">
              {currentMonthData
                ? `${(
                    (currentMonthData.input_tokens +
                      currentMonthData.output_tokens) /
                    1000000
                  ).toFixed(2)}M this month`
                : 'No data this month'}
            </div>
          </div>
        </div>
      </div>

      {costData.length > 0 && (
        <div className="cost-charts">
          <div className="chart-card">
            <h3>Monthly Cost vs Budget</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget ($)" />
                <Bar dataKey="cost" fill="#10b981" name="Spent ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Token Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inputTokens"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Input (K)"
                />
                <Line
                  type="monotone"
                  dataKey="outputTokens"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Output (K)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="cost-table-card">
            <h3>Monthly Breakdown</h3>
            <div className="cost-table">
              <div className="cost-table-header">
                <div>Month</div>
                <div>Input Tokens</div>
                <div>Output Tokens</div>
                <div>Total Cost</div>
                <div>Budget</div>
                <div>Status</div>
              </div>
              {costData
                .slice()
                .reverse()
                .map((item) => {
                  const percent = (item.total_cost / item.monthly_budget) * 100;
                  return (
                    <div key={item.id} className="cost-table-row">
                      <div className="month-cell">{item.month}</div>
                      <div>{(item.input_tokens / 1000).toFixed(1)}K</div>
                      <div>{(item.output_tokens / 1000).toFixed(1)}K</div>
                      <div className="cost-cell">${item.total_cost.toFixed(2)}</div>
                      <div>${item.monthly_budget.toFixed(2)}</div>
                      <div className="status-cell">
                        <div
                          className="status-badge"
                          style={{
                            background:
                              percent >= 90
                                ? '#ef4444'
                                : percent >= 80
                                ? '#f59e0b'
                                : '#10b981',
                          }}
                        >
                          {percent.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {costData.length === 0 && (
        <div className="empty-state">
          <DollarSign size={48} />
          <h3>No cost data yet</h3>
          <p>Cost tracking data will appear here once the scraper runs</p>
        </div>
      )}
    </div>
  );
}

export default CostTracking;
