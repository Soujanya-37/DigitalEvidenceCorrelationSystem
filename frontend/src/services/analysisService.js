import api from './api';
export const runAnalysis=async(caseId)=>(await api.post(`/analysis/${caseId}/run`)).data;
export const getAnalysis=async(caseId)=>(await api.get(`/analysis/${caseId}`)).data;
