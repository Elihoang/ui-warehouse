import api from './api';

class AuthService {
  async login(userName, password) {
    const response = await api.post('/auth/login', {
      userName,
      password,
    });
    
    const { accessToken, refreshToken, user } = response.data;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  }

  async register(userName, email, password, role = 'Staff') {
    const response = await api.post('/auth/register', {
      userName,
      email,
      password,
      role,
    });
    return response.data;
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();