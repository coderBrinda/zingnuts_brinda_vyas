import api from "./api";

export async function fetchProjectMembers(projectId) {
  const { data } = await api.get(`/projects/${projectId}/members`);
  return data.data;
}

export async function fetchAvailableMembers(projectId) {
  const { data } = await api.get(`/projects/${projectId}/members/available`);
  return data.data;
}

export async function assignMember(projectId, memberId) {
  const { data } = await api.post(`/projects/${projectId}/members`, {
    memberId,
  });
  return data.data;
}

export async function removeMember(projectId, memberId) {
  const { data } = await api.delete(
    `/projects/${projectId}/members/${memberId}`
  );
  return data.data;
}
