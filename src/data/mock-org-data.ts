import { Employee, OrgNode, Position, Scenario, HealthFlag } from '@/types/org-builder';

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    department: 'Executive',
    skills: ['Leadership', 'Strategy', 'Operations', 'Finance'],
    matchScore: 95,
  },
  {
    id: 'emp-2',
    name: 'Michael Torres',
    email: 'michael.torres@company.com',
    department: 'Technology',
    skills: ['Engineering Management', 'Architecture', 'Agile', 'Cloud'],
    matchScore: 92,
  },
  {
    id: 'emp-3',
    name: 'Jennifer Walsh',
    email: 'jennifer.walsh@company.com',
    department: 'Operations',
    skills: ['Operations', 'Process Improvement', 'Supply Chain', 'Analytics'],
    matchScore: 88,
  },
  {
    id: 'emp-4',
    name: 'David Kim',
    email: 'david.kim@company.com',
    department: 'Finance',
    skills: ['Financial Planning', 'Accounting', 'Risk Management', 'Budgeting'],
    matchScore: 90,
  },
  {
    id: 'emp-5',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    department: 'HR',
    skills: ['Talent Management', 'Recruiting', 'Employee Relations', 'Compensation'],
    matchScore: 87,
  },
  {
    id: 'emp-6',
    name: 'James Wright',
    email: 'james.wright@company.com',
    department: 'Technology',
    skills: ['Software Development', 'React', 'Node.js', 'AWS'],
    matchScore: 85,
  },
  {
    id: 'emp-7',
    name: 'Lisa Park',
    email: 'lisa.park@company.com',
    department: 'Technology',
    skills: ['Data Science', 'Machine Learning', 'Python', 'SQL'],
    matchScore: 91,
  },
  {
    id: 'emp-8',
    name: 'Robert Johnson',
    email: 'robert.johnson@company.com',
    department: 'Sales',
    skills: ['Sales Leadership', 'Account Management', 'Negotiation', 'CRM'],
    matchScore: 86,
  },
  {
    id: 'emp-9',
    name: 'Amanda Foster',
    email: 'amanda.foster@company.com',
    department: 'Marketing',
    skills: ['Digital Marketing', 'Brand Strategy', 'Analytics', 'Content'],
    matchScore: 84,
  },
  {
    id: 'emp-10',
    name: 'Chris Martinez',
    email: 'chris.martinez@company.com',
    department: 'Technology',
    skills: ['DevOps', 'Kubernetes', 'CI/CD', 'Security'],
    matchScore: 89,
  },
];

const mockPositions: Position[] = [
  {
    id: 'pos-ceo',
    title: 'Chief Executive Officer',
    description: 'Lead overall company strategy and operations',
    requiredSkills: ['Leadership', 'Strategy', 'Operations'],
    level: 1,
    department: 'Executive',
  },
  {
    id: 'pos-cto',
    title: 'Chief Technology Officer',
    description: 'Oversee all technology initiatives and innovation',
    requiredSkills: ['Engineering Management', 'Architecture', 'Strategy'],
    level: 2,
    department: 'Technology',
  },
  {
    id: 'pos-coo',
    title: 'Chief Operating Officer',
    description: 'Manage day-to-day operations and efficiency',
    requiredSkills: ['Operations', 'Process Improvement', 'Leadership'],
    level: 2,
    department: 'Operations',
  },
  {
    id: 'pos-cfo',
    title: 'Chief Financial Officer',
    description: 'Oversee financial planning and risk management',
    requiredSkills: ['Financial Planning', 'Risk Management', 'Strategy'],
    level: 2,
    department: 'Finance',
  },
  {
    id: 'pos-chro',
    title: 'Chief Human Resources Officer',
    description: 'Lead talent strategy and employee experience',
    requiredSkills: ['Talent Management', 'Leadership', 'Strategy'],
    level: 2,
    department: 'HR',
  },
  {
    id: 'pos-vp-eng',
    title: 'VP of Engineering',
    description: 'Lead engineering teams and technical delivery',
    requiredSkills: ['Engineering Management', 'Agile', 'Architecture'],
    level: 3,
    department: 'Technology',
  },
  {
    id: 'pos-vp-data',
    title: 'VP of Data Science',
    description: 'Lead data and analytics initiatives',
    requiredSkills: ['Data Science', 'Machine Learning', 'Leadership'],
    level: 3,
    department: 'Technology',
  },
  {
    id: 'pos-vp-sales',
    title: 'VP of Sales',
    description: 'Drive revenue growth and sales strategy',
    requiredSkills: ['Sales Leadership', 'Strategy', 'Account Management'],
    level: 3,
    department: 'Sales',
  },
  {
    id: 'pos-vp-marketing',
    title: 'VP of Marketing',
    description: 'Lead brand and demand generation',
    requiredSkills: ['Digital Marketing', 'Brand Strategy', 'Leadership'],
    level: 3,
    department: 'Marketing',
  },
  {
    id: 'pos-dir-devops',
    title: 'Director of DevOps',
    description: 'Manage infrastructure and deployment',
    requiredSkills: ['DevOps', 'Cloud', 'Security'],
    level: 4,
    department: 'Technology',
  },
];

export const createBaselineScenario = (): Scenario => {
  const nodes: Record<string, OrgNode> = {
    'node-1': {
      id: 'node-1',
      position: mockPositions[0], // CEO
      employee: mockEmployees[0], // Sarah Chen
      parentId: null,
      children: ['node-2', 'node-3', 'node-4', 'node-5'],
      x: 400,
      y: 50,
    },
    'node-2': {
      id: 'node-2',
      position: mockPositions[1], // CTO
      employee: mockEmployees[1], // Michael Torres
      parentId: 'node-1',
      children: ['node-6', 'node-7', 'node-10'],
      x: 100,
      y: 180,
    },
    'node-3': {
      id: 'node-3',
      position: mockPositions[2], // COO
      employee: mockEmployees[2], // Jennifer Walsh
      parentId: 'node-1',
      children: [],
      x: 300,
      y: 180,
    },
    'node-4': {
      id: 'node-4',
      position: mockPositions[3], // CFO
      employee: mockEmployees[3], // David Kim
      parentId: 'node-1',
      children: [],
      x: 500,
      y: 180,
    },
    'node-5': {
      id: 'node-5',
      position: mockPositions[4], // CHRO
      employee: mockEmployees[4], // Emily Rodriguez
      parentId: 'node-1',
      children: ['node-8', 'node-9'],
      x: 700,
      y: 180,
    },
    'node-6': {
      id: 'node-6',
      position: mockPositions[5], // VP Engineering
      employee: mockEmployees[5], // James Wright
      parentId: 'node-2',
      children: [],
      x: 50,
      y: 310,
    },
    'node-7': {
      id: 'node-7',
      position: mockPositions[6], // VP Data Science
      employee: mockEmployees[6], // Lisa Park
      parentId: 'node-2',
      children: [],
      x: 150,
      y: 310,
    },
    'node-8': {
      id: 'node-8',
      position: mockPositions[7], // VP Sales
      employee: mockEmployees[7], // Robert Johnson
      parentId: 'node-5',
      children: [],
      x: 600,
      y: 310,
    },
    'node-9': {
      id: 'node-9',
      position: mockPositions[8], // VP Marketing - OPEN
      employee: undefined,
      parentId: 'node-5',
      children: [],
      x: 700,
      y: 310,
    },
    'node-10': {
      id: 'node-10',
      position: mockPositions[9], // Director DevOps
      employee: mockEmployees[9], // Chris Martinez
      parentId: 'node-2',
      children: [],
      x: 250,
      y: 310,
    },
  };

  return {
    id: 'baseline',
    name: 'Current Org (Baseline)',
    isBaseline: true,
    createdAt: new Date(),
    nodes,
    rootId: 'node-1',
    freeAgents: [],
  };
};

export const mockHealthFlags: HealthFlag[] = [
  {
    id: 'flag-1',
    type: 'span',
    severity: 'warning',
    message: 'CEO has 6 direct reports (recommended: 5-7)',
    nodeIds: ['node-1'],
  },
  {
    id: 'flag-2',
    type: 'vacancy',
    severity: 'warning',
    message: 'VP of Marketing position is vacant',
    nodeIds: ['node-9'],
  },
];

export const suggestedCandidates = (positionId: string): Employee[] => {
  return mockEmployees
    .filter(emp => emp.matchScore && emp.matchScore > 80)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 3);
};

export const suggestedRoles = (employeeId: string): Position[] => {
  return mockPositions
    .filter(pos => pos.level >= 3)
    .slice(0, 3);
};
