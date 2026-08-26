import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBudgets, createBudget, deleteBudget } from '../api/budgets';
import { getCategories } from '../api/categories';

function currentMonthFirst() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');

  const month = currentMonthFirst();

  async function load() {
    const [b, c] = await Promise.all([
      getBudgets(month.slice(0, 7)),
      getCategories(),
    ]);
    setBudgets(b);
    setCategories(c.filter((cat) => cat.type === 'expense'));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await createBudget(category, month, limit);
      setLimit('');
      load();
    } catch (err) {
      setError('Failed to set budget. A budget for this category and month may already exist.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this budget?')) return;
    await deleteBudget(id);
    load();
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 700, margin: '0 auto' }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h1>Budgets — {month.slice(0, 7)}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ padding: 8, flex: 1 }}>
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="number" step="0.01" placeholder="Monthly limit"
          value={limit} onChange={(e) => setLimit(e.target.value)}
          required style={{ padding: 8, width: 140 }}
        />
        <button type="submit" style={{ padding: 8 }}>Set Budget</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {budgets.length === 0 ? (
        <p style={{ color: '#666' }}>No budgets set for this month yet.</p>
      ) : (
        budgets.map((b) => {
          const pct = b.limit_amount > 0 ? Math.min((b.spent / b.limit_amount) * 100, 100) : 0;
          const over = b.spent > b.limit_amount;
          return (
            <div key={b.id} style={{ marginBottom: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>{b.category_name}</strong>
                <span>
                  ₹{b.spent} / ₹{b.limit_amount}
                  <button onClick={() => handleDelete(b.id)} style={{ marginLeft: 12 }} style={{background: '#dc2626'}}>Delete</button>
                </span>
              </div>
              <div style={{ background: '#eee', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: over ? '#dc2626' : '#059669',
                }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}