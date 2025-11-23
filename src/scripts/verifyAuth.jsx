import axios from 'axios';

const VERIFY_URL = 'http://localhost:5000/api/auth/verify';

export default async function verifyAuth(token) {
  if (!token) return { success: false, message: 'No token provided' };

  try {
    const resp = await axios.post(VERIFY_URL, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return resp.data;
  } catch (error) {
    if (error.response) {
      return { success: false, status: error.response.status, data: error.response.data };
    }
    return { success: false, message: error.message || 'Network error' };
  }
}
