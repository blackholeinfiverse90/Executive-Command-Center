// Mock data service — used as fallback when SETU API is unreachable
// To connect to live data, the adapter in services/adapter.js calls this only on failure.

export const fetchCommandData = async () => ({
  dataAsOf: new Date().toISOString(),
  dataSource: 'mock-fallback',
  summary: {
    overallHealth: 'amber',
    deliveryConfidence: 94,
    confidenceTrend: 'up',
    activeProjects: 12,
    criticalRisks: 3,
    pendingDecisions: 2,
    resourceUtilization: 87,
    // 7-day confidence history — powers ConfidenceTrendChart
    confidenceHistory: [
      { day: 'Mon', value: 88 },
      { day: 'Tue', value: 86 },
      { day: 'Wed', value: 89 },
      { day: 'Thu', value: 91 },
      { day: 'Fri', value: 90 },
      { day: 'Sat', value: 92 },
      { day: 'Sun', value: 94 },
    ],
  },

  alerts: [
    { id: 'a1', severity: 'critical', title: 'Dependency block — Project Kiran', time: '14:28', slaRemaining: '2h' },
    { id: 'a2', severity: 'high',     title: 'Resource overload — Backend Team', time: '13:45', slaRemaining: '6h' },
    { id: 'a3', severity: 'high',     title: 'Decision overdue — Vendor selection', time: '12:10', slaRemaining: '1d' },
    { id: 'a4', severity: 'medium',   title: 'Milestone slip — Project Arjun +3d', time: '11:00', slaRemaining: '3d' },
  ],

  projects: [
    { id: 'p1', name: 'Project Alpha', status: 'green',  progress: 78, nextMilestone: 'Sprint Review', owner: 'Ravi S.',   lastUpdated: '14:20' },
    { id: 'p2', name: 'Project Kiran', status: 'red',    progress: 34, nextMilestone: 'BLOCKED',        owner: 'Priya M.',  lastUpdated: '14:28' },
    { id: 'p3', name: 'Project Arjun', status: 'amber',  progress: 61, nextMilestone: 'Design Review',  owner: 'Amit K.',   lastUpdated: '13:50' },
    { id: 'p4', name: 'Project Delta', status: 'green',  progress: 92, nextMilestone: 'Launch',         owner: 'Sneha R.',  lastUpdated: '12:00' },
    { id: 'p5', name: 'Project Sigma', status: 'amber',  progress: 55, nextMilestone: 'QA Sign-off',    owner: 'Dev T.',    lastUpdated: '11:30' },
    { id: 'p6', name: 'Project Omega', status: 'green',  progress: 83, nextMilestone: 'UAT',            owner: 'Kavya L.',  lastUpdated: '10:45' },
  ],

  risks: [
    { id: 'r1', title: 'Vendor delay',       severity: 'critical', project: 'Project Kiran', owner: 'Priya M.',  mitigation: 'In progress' },
    { id: 'r2', title: 'Scope creep',         severity: 'high',     project: 'Project Arjun', owner: 'Amit K.',   mitigation: 'Pending' },
    { id: 'r3', title: 'Key person dependency', severity: 'high',   project: 'Project Delta', owner: 'Sneha R.',  mitigation: 'Planned' },
    { id: 'r4', title: 'Tech debt accumulation', severity: 'medium', project: 'Project Sigma', owner: 'Dev T.',   mitigation: 'Scheduled' },
  ],

  resources: [
    { team: 'Backend',  allocated: 94, available: 6,  overload: true },
    { team: 'Frontend', allocated: 72, available: 28, overload: false },
    { team: 'Design',   allocated: 58, available: 42, overload: false },
    { team: 'QA',       allocated: 88, available: 12, overload: false },
    { team: 'DevOps',   allocated: 101, available: 0, overload: true },
  ],

  milestones: [
    { id: 'm1', project: 'Project Alpha', name: 'Sprint Review',  planned: 'Jan 28', forecast: 'Jan 28', variance: 0,  status: 'on-track' },
    { id: 'm2', project: 'Project Arjun', name: 'Design Review',  planned: 'Jan 25', forecast: 'Jan 28', variance: 3,  status: 'slipping' },
    { id: 'm3', project: 'Project Delta', name: 'Launch',         planned: 'Feb 01', forecast: 'Feb 01', variance: 0,  status: 'on-track' },
    { id: 'm4', project: 'Project Sigma', name: 'QA Sign-off',    planned: 'Feb 05', forecast: 'Feb 10', variance: 5,  status: 'at-risk' },
    { id: 'm5', project: 'Project Kiran', name: 'Dev Complete',   planned: 'Feb 14', forecast: 'Mar 01', variance: 15, status: 'blocked' },
  ],

  decisions: [
    { id: 'd1', title: 'Vendor selection',     deadline: 'Jan 27', owner: 'Ravi S.',  status: 'overdue',  daysLeft: -1 },
    { id: 'd2', title: 'Architecture review',  deadline: 'Jan 30', owner: 'Priya M.', status: 'pending',  daysLeft: 3 },
    { id: 'd3', title: 'Budget reallocation',  deadline: 'Feb 02', owner: 'Amit K.',  status: 'pending',  daysLeft: 6 },
  ],

  activity: [
    { id: 'ac1', actor: 'Sneha R.',  action: 'closed sprint',    entity: 'Project Alpha', time: '14:28' },
    { id: 'ac2', actor: 'Priya M.',  action: 'raised risk',      entity: 'Project Kiran', time: '13:45' },
    { id: 'ac3', actor: 'Dev T.',    action: 'met milestone',    entity: 'Project Delta', time: '12:10' },
    { id: 'ac4', actor: 'Amit K.',   action: 'updated forecast', entity: 'Project Arjun', time: '11:00' },
    { id: 'ac5', actor: 'Kavya L.',  action: 'completed UAT',    entity: 'Project Omega', time: '10:30' },
  ],

  // Cross-project dependency blockers — surfaces in DependencyZone
  dependencies: [
    { id: 'dep1', from: 'Project Kiran', to: 'Project Alpha', type: 'blocked-by', reason: 'API contract not finalised', severity: 'critical', since: '2d' },
    { id: 'dep2', from: 'Project Sigma', to: 'Project Delta', type: 'waiting-on', reason: 'QA environment shared',       severity: 'high',     since: '1d' },
    { id: 'dep3', from: 'Project Arjun', to: 'Project Omega', type: 'waiting-on', reason: 'Design assets pending',       severity: 'medium',   since: '4h' },
  ],

  // Escalations — surfaces in DetailPanel (L2, Tier 3)
  escalations: [
    { id: 'e1', title: 'Vendor unresponsive for 48h',      raisedBy: 'Priya M.',  raisedTo: 'Ravi S.',  project: 'Project Kiran', status: 'open',         daysOpen: 2, description: 'Vendor has not responded to API contract queries. Blocking dev completion.' },
    { id: 'e2', title: 'Backend team at 101% — burnout risk', raisedBy: 'Dev T.',    raisedTo: 'Amit K.',  project: 'Project Sigma', status: 'acknowledged', daysOpen: 1, description: 'DevOps and Backend both overloaded. Risk of key person leaving mid-sprint.' },
  ],

  // Evidence — surfaces in DetailPanel (L2, Tier 3)
  evidence: [
    { id: 'ev1', title: 'Vendor SLA Agreement v2.pdf',    type: 'document',   uploadedBy: 'Priya M.',  uploadedAt: 'Jan 24', project: 'Project Kiran' },
    { id: 'ev2', title: 'Sprint Velocity Report — Jan',   type: 'report',     uploadedBy: 'Sneha R.',  uploadedAt: 'Jan 22', project: 'Project Alpha' },
    { id: 'ev3', title: 'Architecture Decision Record',   type: 'document',   uploadedBy: 'Amit K.',   uploadedAt: 'Jan 20', project: 'Project Arjun' },
    { id: 'ev4', title: 'Resource Utilisation Dashboard', type: 'link',       uploadedBy: 'Dev T.',    uploadedAt: 'Jan 25', project: 'Project Sigma' },
  ],

  // Portfolio-level delivery forecast — surfaces in DeliveryZone
  forecast: {
    onTrack:  3,   // projects on track
    atRisk:   2,   // projects at risk
    blocked:  1,   // projects blocked
    total:    6,
    portfolioConfidence: 94,   // % overall
    confidenceDelta: +2,       // change since last refresh
    projectedSlipDays: 4,      // weighted avg slip across portfolio
  },
})
