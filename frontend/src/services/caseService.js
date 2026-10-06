import api from "./api";

// Get all cases
export const getCases = async () => {
  const response = await api.get("/cases/");
  return response.data;
};

// Get one case by UUID
export const getCaseById = async (id) => {
  const response = await api.get(`/cases/${id}`);
  return response.data;
};

// Create a new case
export const createCase = async (caseData) => {
  const response = await api.post("/cases/", caseData);
  return response.data;
};

// Delete a case
export const deleteCase = async (id) => {
  const response = await api.delete(`/cases/${id}`);
  return response.data;
};