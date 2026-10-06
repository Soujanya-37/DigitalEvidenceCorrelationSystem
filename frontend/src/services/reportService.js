import api from './api';
export const downloadReport=async(caseId)=>{const r=await api.get(`/reports/${caseId}/summary`,{responseType:'blob'}); const url=URL.createObjectURL(r.data); const a=document.createElement('a'); a.href=url; a.download=`${caseId}-investigation-report.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);};
