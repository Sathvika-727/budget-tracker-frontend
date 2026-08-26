import client from './client';

export async function getCategories() {
  const response = await client.get('/categories/');
  return response.data;
}

export async function createCategory(name, type) {
  const response = await client.post('/categories/', { name, type });
  return response.data;
}

export async function deleteCategory(id) {
  await client.delete(`/categories/${id}/`);
}