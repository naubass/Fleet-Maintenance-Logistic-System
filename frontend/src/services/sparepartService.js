const API_URL = 'http://localhost:5000/api/spareparts';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const sparepartService = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}?${query}` : API_URL;
    const res = await fetch(url, { headers: getHeaders() });
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

  async update(id, payload) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
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