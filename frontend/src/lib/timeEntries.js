import api from "./api";

export async function fetchTimeEntries(projectId, params = {}) {
  const { data } = await api.get(`/projects/${projectId}/time-entries`, {
    params,
  });
  return data.data;
}

export async function createTimeEntry(projectId, payload) {
  const { data } = await api.post(
    `/projects/${projectId}/time-entries`,
    payload
  );
  return data.data;
}

export async function updateTimeEntry(entryId, payload) {
  const { data } = await api.patch(`/time-entries/${entryId}`, payload);
  return data.data;
}

export async function deleteTimeEntry(entryId) {
  const { data } = await api.delete(`/time-entries/${entryId}`);
  return data.data;
}
