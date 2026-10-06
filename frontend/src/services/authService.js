import api from "./api";

// Login
export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

// Get currently logged-in user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};