import api from "./api";

export async function fetchProjects() {
  const { data } = await api.get("/projects");
  return data.data;
}

export async function fetchProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data.data;
}

export async function createProject(payload) {
  const { data } = await api.post("/projects", payload);
  return data.data;
}

export async function updateProject(id, payload) {
  const { data } = await api.patch(`/projects/${id}`, payload);
  return data.data;
}

export async function deleteProject(id) {
  const { data } = await api.delete(`/projects/${id}`);
  return data.data;
}

export function formatMonthLabel(monthKey) {
  if (!monthKey) return "";
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatHours(hours) {
  return `${Number(hours).toFixed(1)}h`;
}
