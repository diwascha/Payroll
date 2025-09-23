export const dashboardMetrics = [
  { label: 'Active Employees', value: 268, trend: '+12 this month', icon: 'users' },
  { label: 'Headcount Plan', value: '92%', trend: '16 roles hiring', icon: 'flag' },
  { label: 'Payroll Accuracy', value: '99.4%', trend: '0 escalations', icon: 'shield' },
  { label: 'Engagement Pulse', value: '8.7', trend: 'Top quartile', icon: 'pulse' }
];

export const executiveHighlights = {
  spanMetrics: [
    { label: 'Attrition Forecast', value: '7.2%', badge: 'Stable' },
    { label: 'Retention Index', value: '92', badge: '+5 vs last Q' },
    { label: 'Manager NPS', value: '46', badge: 'Green zone' }
  ],
  upcomingEvents: [
    { title: 'Payroll funding window closes in 2d', owner: 'Finance Ops' },
    { title: 'Quarterly compliance attestation', owner: 'People Ops' },
    { title: 'Leadership calibration round', owner: 'Talent Partners' }
  ],
  engagementSignals: [
    { team: 'Product Design', score: 62, delta: -12 },
    { team: 'Customer Success', score: 78, delta: 6 },
    { team: 'Engineering', score: 88, delta: 3 }
  ]
};

export const workforceMoments = {
  anniversaries: [
    { name: 'Ava Collins', role: 'Product Manager', tenure: '3 years' },
    { name: 'Noah Martinez', role: 'QA Engineer', tenure: '1 year' }
  ],
  upcomingTimeOff: [
    { name: 'Maya Patel', role: 'Design Lead', date: 'Apr 12', length: '5 days' },
    { name: 'Ethan Wright', role: 'Customer Lead', date: 'Apr 15', length: '2 days' }
  ],
  hiringPipeline: [
    { stage: 'Sourcing', count: 24 },
    { stage: 'Screening', count: 11 },
    { stage: 'Interviews', count: 6 },
    { stage: 'Offers', count: 3 }
  ]
};

export const analytics = {
  monthlyHeadcount: [
    { month: 'Oct', value: 198 },
    { month: 'Nov', value: 204 },
    { month: 'Dec', value: 211 },
    { month: 'Jan', value: 224 },
    { month: 'Feb', value: 231 },
    { month: 'Mar', value: 245 },
    { month: 'Apr', value: 268 }
  ],
  payrollDrilldown: [
    { label: 'Gross Pay', value: 185000 },
    { label: 'Taxes', value: 29000 },
    { label: 'Benefits', value: 21000 },
    { label: 'Bonuses', value: 12500 }
  ],
  attendanceCompliance: [
    { label: 'On-Time', value: 86 },
    { label: 'Late', value: 9 },
    { label: 'Absent', value: 5 }
  ]
};

export const employees = [
  {
    id: 'EMP-9102',
    name: 'Ava Collins',
    role: 'Product Manager',
    department: 'Product',
    location: 'Berlin',
    status: 'Active',
    squad: 'Product Design',
    level: 'L4',
    email: 'ava.collins@novahr.io'
  },
  {
    id: 'EMP-2391',
    name: 'Oliver Becker',
    role: 'Backend Engineer',
    department: 'Engineering',
    location: 'Munich',
    status: 'On Leave',
    squad: 'Core Services',
    level: 'L3',
    email: 'oliver.becker@novahr.io'
  },
  {
    id: 'EMP-7824',
    name: 'Maya Patel',
    role: 'Design Lead',
    department: 'Product',
    location: 'Remote - UK',
    status: 'Active',
    squad: 'Experience Lab',
    level: 'L5',
    email: 'maya.patel@novahr.io'
  },
  {
    id: 'EMP-4552',
    name: 'Lucas Martin',
    role: 'Data Scientist',
    department: 'Analytics',
    location: 'Remote - Spain',
    status: 'Active',
    squad: 'Insights Guild',
    level: 'L4',
    email: 'lucas.martin@novahr.io'
  },
  {
    id: 'EMP-6420',
    name: 'Sofia Almeida',
    role: 'People Partner',
    department: 'People Ops',
    location: 'Lisbon',
    status: 'Active',
    squad: 'People Advisory',
    level: 'L4',
    email: 'sofia.almeida@novahr.io'
  },
  {
    id: 'EMP-5093',
    name: 'Jasper Chen',
    role: 'Solutions Consultant',
    department: 'Customer Success',
    location: 'Singapore',
    status: 'Travel',
    squad: 'Enterprise Accounts',
    level: 'L3',
    email: 'jasper.chen@novahr.io'
  },
  {
    id: 'EMP-1284',
    name: 'Noah Martinez',
    role: 'QA Engineer',
    department: 'Engineering',
    location: 'Madrid',
    status: 'Active',
    squad: 'Quality Core',
    level: 'L2',
    email: 'noah.martinez@novahr.io'
  },
  {
    id: 'EMP-3345',
    name: 'Mila Jensen',
    role: 'Compensation Analyst',
    department: 'Finance',
    location: 'Copenhagen',
    status: 'Active',
    squad: 'Total Rewards',
    level: 'L3',
    email: 'mila.jensen@novahr.io'
  }
];

export const payrollRuns = [
  {
    cycle: 'April 2024',
    payDate: 'Apr 27',
    status: 'Funding Scheduled',
    employees: 268,
    netPay: '€162,450',
    variance: '+0.4%'
  },
  {
    cycle: 'March 2024',
    payDate: 'Mar 27',
    status: 'Closed',
    employees: 259,
    netPay: '€155,210',
    variance: '+0.2%'
  },
  {
    cycle: 'February 2024',
    payDate: 'Feb 27',
    status: 'Closed',
    employees: 252,
    netPay: '€152,480',
    variance: '-0.1%'
  }
];

export const attendanceHeatmap = [
  {
    name: 'Product Design',
    compliance: 92,
    pattern: [96, 88, 92, 94, 90, 97, 91]
  },
  {
    name: 'Engineering',
    compliance: 89,
    pattern: [82, 87, 91, 90, 94, 92, 89]
  },
  {
    name: 'Customer Success',
    compliance: 94,
    pattern: [95, 96, 98, 92, 94, 93, 95]
  }
];

export const performanceReviews = [
  {
    name: 'Ava Collins',
    role: 'Product Manager',
    score: 4.6,
    potential: 'High',
    focus: 'Leadership',
    summary: 'Driving roadmap alignment and customer outcomes.'
  },
  {
    name: 'Lucas Martin',
    role: 'Data Scientist',
    score: 4.3,
    potential: 'High',
    focus: 'Experimentation',
    summary: 'Deploying predictive churn models across customer segments.'
  },
  {
    name: 'Mila Jensen',
    role: 'Compensation Analyst',
    score: 4.1,
    potential: 'Medium',
    focus: 'Benchmarking',
    summary: 'Standardising geo-differentials and rewards frameworks.'
  }
];

export const systemSettings = {
  security: [
    { name: 'SCIM Provisioning', enabled: true },
    { name: 'Just-in-time Access', enabled: true },
    { name: 'Geo-Fencing', enabled: false }
  ],
  workflows: [
    { name: 'Onboarding Journey', status: 'Live', runs: 142 },
    { name: 'Payroll Exceptions', status: 'In Review', runs: 28 },
    { name: 'Annual Review Cycle', status: 'Live', runs: 3 }
  ],
  billing: {
    plan: 'Enterprise',
    seatsUsed: 268,
    seatsTotal: 320,
    nextInvoice: 'May 01, 2024',
    addOns: ['Advanced Analytics', 'AI Playbooks']
  }
};
