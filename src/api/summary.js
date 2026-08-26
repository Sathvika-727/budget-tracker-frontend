import client from './client';

export async function getMonthlySummary(month) {
  const response = await client.get(`/summary/monthly/?month=${month}`);
  return response.data;
}

export async function getTrend(months = 6) {
  const response = await client.get(`/summary/trend/?months=${months}`);
  return response.data;
}