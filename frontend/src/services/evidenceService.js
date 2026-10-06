import api from "../api/api";

export const uploadEvidence = async (file, caseId, evidenceType, description = "", eventTimestamp = "", eventLocation = "", provenance = "Investigator upload", acquisitionMethod = "Digital file upload") => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("case_id", caseId);
  fd.append("evidence_type", evidenceType);
  fd.append("description", description);
  fd.append("event_timestamp", eventTimestamp);
  fd.append("event_location", eventLocation);
  fd.append("provenance", provenance);
  fd.append("acquisition_method", acquisitionMethod);
  const r = await api.post("/evidence/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
  return r.data;
};

export const getCaseEvidence = async (caseId) => (await api.get(`/evidence/case/${caseId}`)).data;
export const processEvidence = async (id) => (await api.post(`/evidence/${id}/process`)).data;

export const getEvidencePreview = async (id) => {
  const response = await api.get(`/evidence/${id}/file`, { responseType: "blob" });
  return URL.createObjectURL(response.data);
};
