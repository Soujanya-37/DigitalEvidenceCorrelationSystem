export const caseList = [
  {
    id: 1,
    title: 'Warehouse Incident Review',
    status: 'In Review',
    priority: 'High',
    updated: '12 min ago',
    summary: 'Cross-referencing CCTV, GPS, and witness statements from the 04:18 regional incident.',
    confidence: '93%',
    owner: 'Analyst Mina Alvarez',
  },
  {
    id: 2,
    title: 'Transit Alibi Verification',
    status: 'Queued',
    priority: 'Medium',
    updated: '1 hr ago',
    summary: 'Reconciling travel logs, payment metadata, and mobile signal pings.',
    confidence: '86%',
    owner: 'Analyst Daniel Reyes',
  },
  {
    id: 3,
    title: 'Perimeter Access Breach',
    status: 'Escalated',
    priority: 'Critical',
    updated: '3 hrs ago',
    summary: 'Tracing access control logs, biometric scans, and entry camera footage.',
    confidence: '97%',
    owner: 'Lead Investigator Sara Khan',
  },
];

export const timelineEvents = [
  { id: 1, time: '04:12', title: 'CCTV feed captured from east corridor', type: 'Video' },
  { id: 2, time: '04:18', title: 'GPS geofence exit detected', type: 'GPS' },
  { id: 3, time: '04:24', title: 'Mobile signal handoff matched to tower cluster', type: 'Signal' },
  { id: 4, time: '04:31', title: 'Transaction authentication request logged', type: 'Transaction' },
];

export const aiFindings = [
  { label: 'Correlated signals', value: '17', detail: 'Across video, geolocation, and device logs', tone: 'cyan' },
  { label: 'Confidence score', value: '93%', detail: 'Based on layered evidence weighting', tone: 'emerald' },
  { label: 'Anomalies', value: '2', detail: 'Requires analyst review before escalation', tone: 'amber' },
  { label: 'Evidence items', value: '128', detail: 'Stored and indexed for rapid retrieval', tone: 'violet' },
];

export const evidenceTypes = [
  'CCTV footage',
  'Mobile telemetry',
  'Card transactions',
  'Witness statements',
  'Call detail records',
];

export const activityFeed = [
  { id: 1, title: 'Case bundle synced', detail: 'Warehouse review updated with 6 new artifacts', time: '2 min ago' },
  { id: 2, title: 'Timeline coherence improved', detail: 'AI alignment score increased to 93%', time: '14 min ago' },
  { id: 3, title: 'Report generation queued', detail: 'Executive briefing prepared for review', time: '41 min ago' },
];
