import axios from "axios";

// Replace 3000 if your NestJS backend runs on a different port
const API_URL = "http://localhost:3000/auth";

export async function login(email: string, password: string) {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data; // should contain { access_token: "..." }
}

export async function register(email: string, name: string, password: string) {
  const res = await axios.post(`${API_URL}/register`, { email, name, password });
  return res.data;
}
