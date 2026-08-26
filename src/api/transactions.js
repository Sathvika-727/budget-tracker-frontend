import client from './client';

export async function getTransactions(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const response = await client.get(`/transactions/?${params}`);
  return response.data;
}

export async function createTransaction(data) {
  const response = await client.post('/transactions/', data);
  return response.data;
}

export async function deleteTransaction(id) {
  await client.delete(`/transactions/${id}/`);
}