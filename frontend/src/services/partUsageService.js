const API_URL = 'http://localhost:5000/api/part-usages';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const partUsageService = {
  async getByRecord(recordId) {
    const res = await fetch(`${API_URL}/record/${recordId}`, { headers: getHeaders() });
    return await res.json();
  },

  async create(payload) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  }
};