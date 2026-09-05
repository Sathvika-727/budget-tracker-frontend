import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, createCategory, deleteCategory } from '../api/categories';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [error, setError] = useState('');

  async function load() {
    const data = await getCategories();
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await createCategory(name, type);
      setName('');
      load();
    } catch (err) {
      setError('Failed to create category. Name may already exist.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    setError('');
    try {
      await deleteCategory(id);
      load();
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete category.';
      setError(message);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 700, margin: '0 auto' }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h1>Categories</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: 1, padding: 8 }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 8 }}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit" style={{ padding: 8 }}>Add</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Type</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{cat.name}</td>
              <td style={{ padding: 8 }}>{cat.type}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => handleDelete(cat.id)} style={{background: '#dc2626'}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}