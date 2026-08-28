const API_URL = '/api/schedules';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const scheduleService = {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${API_URL}?${query}` : API_URL;
      
      const res = await fetch(url, { headers: getHeaders() });
      return await res.json();
    },

    // Tambah jadwal baru
    async create(payload) {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      return await res.json();
    },

    // Perbarui jadwal
    async update(id, payload) {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      return await res.json();
    },

    // Hapus jadwal
    async delete(id) {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    }
}