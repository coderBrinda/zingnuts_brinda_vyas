import api from "./api";

export async function fetchUsers(params = {}) {
  const { data } = await api.get("/users", { params });
  return data.data;
}

export async function createUser(payload) {
  const { data } = await api.post("/users", payload);
  return data.data;
}

export async function updateUser(userId, payload) {
  const { data } = await api.patch(`/users/${userId}`, payload);
  return data.data;
}

export async function deactivateUser(userId) {
  const { data } = await api.delete(`/users/${userId}`);
  return data.data;
}
