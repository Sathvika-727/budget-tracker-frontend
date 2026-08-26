import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions, createTransaction, deleteTransaction } from '../api/transactions';
import { getCategories } from '../api/categories';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: '',
    amount: '',
    type: 'expense',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');

  async function load() {
    const [txns, cats] = await Promise.all([getTransactions(), getCategories()]);
    setTransactions(txns);
    setCategories(cats);
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await createTransaction(form);
      setForm({ ...form, amount: '', description: '' });
      load();
    } catch (err) {
      setError('Failed to add transaction. Check category type matches transaction type.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    load();
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h1>Transactions</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <select name="category" value={form.category} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
          ))}
        </select>
        <select name="type" value={form.type} onChange={handleChange} style={{ padding: 8 }}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="number" step="0.01" name="amount" placeholder="Amount"
          value={form.amount} onChange={handleChange} required style={{ padding: 8, width: 100 }}
        />
        <input
          type="text" name="description" placeholder="Description"
          value={form.description} onChange={handleChange} style={{ padding: 8, flex: 1 }}
        />
        <input
          type="date" name="date" value={form.date} onChange={handleChange} required style={{ padding: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>Add</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: 8 }}>Date</th>
            <th style={{ padding: 8 }}>Category</th>
            <th style={{ padding: 8 }}>Type</th>
            <th style={{ padding: 8 }}>Amount</th>
            <th style={{ padding: 8 }}>Description</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{t.date}</td>
              <td style={{ padding: 8 }}>{t.category_name}</td>
              <td style={{ padding: 8, color: t.type === 'income' ? '#059669' : '#dc2626' }}>{t.type}</td>
              <td style={{ padding: 8 }}>₹{t.amount}</td>
              <td style={{ padding: 8 }}>{t.description}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => handleDelete(t.id)} style={{background: '#dc2626'}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}