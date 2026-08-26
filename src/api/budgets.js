import client from './client';

export async function getBudgets(month) {
  const params = month ? `?month=${month}` : '';
  const response = await client.get(`/budgets/${params}`);
  return response.data;
}

export async function createBudget(category, month, limit_amount) {
  const response = await client.post('/budgets/', { category, month, limit_amount });
  return response.data;
}

export async function deleteBudget(id) {
  await client.delete(`/budgets/${id}/`);
}