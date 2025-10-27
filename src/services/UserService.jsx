import axios from "axios";

class UserService {
  static BASE_URL = "http://localhost:9005/api";

  // Use email instead of username
  static async login(email, password) {
    try {
      const response = await axios.post(`${UserService.BASE_URL}/auth/login`, { email, password });
      // backend returns { token, refreshToken, role, ... }
      return response.data; 
    } catch (err) {
      throw err;
    }
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  }

  static isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static getRole() {
    return localStorage.getItem("role");
  }
}

export default UserService;
