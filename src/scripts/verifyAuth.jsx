import { loadFromStorage } from './StorageSaver';
import axios from 'axios';

const VERIFY_URL = 'http://localhost:5000/api/auth/verify';

export default async function verifyAuth() {
  const data = loadFromStorage("authData") || null;
  const token = data && data.token ? data.token : null;
  
  if (!token) return { success: false, message: 'No token provided' };

  try {
    const resp = await axios.post(VERIFY_URL, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Include the locally-stored token so callers can set Authorization headers
    return { ...(resp.data || {}), token };
  } catch (error) {
    if (error.response) {
      return { success: false, status: error.response.status, data: error.response.data, token };
    }
    return { success: false, message: error.message || 'Network error', token };
  }
}
