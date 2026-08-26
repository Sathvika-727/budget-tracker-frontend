import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logout } from '../api/auth';
import { getMonthlySummary, getTrend } from '../api/summary';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, trendData] = await Promise.all([
          getMonthlySummary(currentMonth()),
          getTrend(6),
        ]);
        setSummary(summaryData);
        setTrend(trendData);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/categories">Categories</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/budgets">Budget</Link>
        </div>
        <button onClick={handleLogout}>Log Out</button>
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 24, marginBottom: 40 }}>
        <div style={{ flex: 1, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <p style={{ color: '#666', marginBottom: 4 }}>Income</p>
          <h2 style={{ margin: 0, color: '#059669' }}>₹{summary?.total_income ?? 0}</h2>
        </div>
        <div style={{ flex: 1, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <p style={{ color: '#666', marginBottom: 4 }}>Expense</p>
          <h2 style={{ margin: 0, color: '#dc2626' }}>₹{summary?.total_expense ?? 0}</h2>
        </div>
        <div style={{ flex: 1, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <p style={{ color: '#666', marginBottom: 4 }}>Net</p>
          <h2 style={{ margin: 0 }}>₹{summary?.net ?? 0}</h2>
        </div>
      </div>

      <h3>Spending by Category</h3>
      {summary?.by_category?.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={summary.by_category}
              dataKey="total"
              nameKey="category__name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {summary.by_category.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: '#666' }}>No expenses recorded this month yet.</p>
      )}

      <h3 style={{ marginTop: 40 }}>6-Month Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#059669" />
          <Line type="monotone" dataKey="expense" stroke="#dc2626" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}