import api from './api';
export const getTimeline=async(caseId)=>(await api.get(`/timeline/${caseId}`)).data;
