import { Employee, OrgNode, Position, Scenario, HealthFlag } from '@/types/org-builder';

const firstNames = ['Sarah', 'Michael', 'Jennifer', 'David', 'Emily', 'James', 'Lisa', 'Robert', 'Amanda', 'Chris', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Stephanie', 'Andrew', 'Nicole', 'Joshua', 'Elizabeth', 'Ryan', 'Megan', 'Brandon', 'Rachel', 'Kevin', 'Lauren', 'Justin', 'Samantha', 'Tyler', 'Kayla', 'Aaron', 'Brittany', 'Adam', 'Hannah', 'Nathan', 'Olivia', 'Jacob', 'Emma', 'Ethan', 'Ava', 'Noah', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'Liam', 'Charlotte', 'Benjamin', 'Amelia', 'Alexander'];
const lastNames = ['Chen', 'Torres', 'Walsh', 'Kim', 'Rodriguez', 'Wright', 'Park', 'Johnson', 'Foster', 'Martinez', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Young', 'Allen', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Ramirez', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Flores'];
const departments = ['Executive', 'Technology', 'Operations', 'Finance', 'HR', 'Sales', 'Marketing'];
const allSkills = ['Leadership', 'Strategy', 'Operations', 'Finance', 'Engineering Management', 'Architecture', 'Agile', 'Cloud', 'Process Improvement', 'Supply Chain', 'Analytics', 'Financial Planning', 'Accounting', 'Risk Management', 'Budgeting', 'Talent Management', 'Recruiting', 'Employee Relations', 'Compensation', 'Software Development', 'React', 'Node.js', 'AWS', 'Data Science', 'Machine Learning', 'Python', 'SQL', 'Sales Leadership', 'Account Management', 'Negotiation', 'CRM', 'Digital Marketing', 'Brand Strategy', 'Content', 'DevOps', 'Kubernetes', 'CI/CD', 'Security', 'Communication', 'Project Management'];

const generateEmployee = (id: number): Employee => {
  const firstName = firstNames[id % firstNames.length];
  const lastName = lastNames[(id * 7) % lastNames.length];
  const dept = departments[id % departments.length];
  const numSkills = 2 + (id % 4);
  const skills: string[] = [];
  for (let i = 0; i < numSkills; i++) {
    skills.push(allSkills[(id + i * 3) % allSkills.length]);
  }
  return {
    id: `emp-${id}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    department: dept,
    skills,
    matchScore: 70 + (id % 30),
  };
};

export const mockEmployees: Employee[] = Array.from({ length: 110 }, (_, i) => generateEmployee(i + 1));

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
  const nodes: Record<string, OrgNode> = {};
  let nodeCounter = 1;
  let employeeIndex = 0;

  const createNode = (positionIndex: number, parentId: string | null, x: number, y: number): string => {
    const nodeId = `node-${nodeCounter++}`;
    nodes[nodeId] = {
      id: nodeId,
      position: mockPositions[positionIndex % mockPositions.length],
      employee: mockEmployees[employeeIndex++],
      parentId,
      children: [],
      x,
      y,
    };
    return nodeId;
  };

  // CEO at root
  const ceoId = createNode(0, null, 400, 50);

  // C-Suite (4 direct reports)
  const ctoId = createNode(1, ceoId, 100, 180);
  const cooId = createNode(2, ceoId, 300, 180);
  const cfoId = createNode(3, ceoId, 500, 180);
  const chroId = createNode(4, ceoId, 700, 180);
  nodes[ceoId].children = [ctoId, cooId, cfoId, chroId];

  // VPs under CTO (3 VPs)
  const vpEng = createNode(5, ctoId, 50, 310);
  const vpData = createNode(6, ctoId, 150, 310);
  const dirDevOps = createNode(9, ctoId, 250, 310);
  nodes[ctoId].children = [vpEng, vpData, dirDevOps];

  // VPs under CHRO
  const vpSales = createNode(7, chroId, 600, 310);
  const vpMarketing = createNode(8, chroId, 700, 310);
  nodes[chroId].children = [vpSales, vpMarketing];

  // Directors and Managers under VPs - Engineering team (15 people)
  const engTeam: string[] = [];
  for (let i = 0; i < 15; i++) {
    const nodeId = createNode(5, vpEng, 0, 440);
    engTeam.push(nodeId);
  }
  nodes[vpEng].children = engTeam;

  // Data Science team (12 people)
  const dataTeam: string[] = [];
  for (let i = 0; i < 12; i++) {
    const nodeId = createNode(6, vpData, 0, 440);
    dataTeam.push(nodeId);
  }
  nodes[vpData].children = dataTeam;

  // DevOps team (8 people)
  const devOpsTeam: string[] = [];
  for (let i = 0; i < 8; i++) {
    const nodeId = createNode(9, dirDevOps, 0, 440);
    devOpsTeam.push(nodeId);
  }
  nodes[dirDevOps].children = devOpsTeam;

  // COO team (15 people)
  const opsTeam: string[] = [];
  for (let i = 0; i < 15; i++) {
    const nodeId = createNode(2, cooId, 0, 310);
    opsTeam.push(nodeId);
  }
  nodes[cooId].children = opsTeam;

  // CFO team (10 people)
  const financeTeam: string[] = [];
  for (let i = 0; i < 10; i++) {
    const nodeId = createNode(3, cfoId, 0, 310);
    financeTeam.push(nodeId);
  }
  nodes[cfoId].children = financeTeam;

  // Sales team (20 people)
  const salesTeam: string[] = [];
  for (let i = 0; i < 20; i++) {
    const nodeId = createNode(7, vpSales, 0, 440);
    salesTeam.push(nodeId);
  }
  nodes[vpSales].children = salesTeam;

  // Marketing team (10 people)
  const marketingTeam: string[] = [];
  for (let i = 0; i < 10; i++) {
    const nodeId = createNode(8, vpMarketing, 0, 440);
    marketingTeam.push(nodeId);
  }
  nodes[vpMarketing].children = marketingTeam;

  return {
    id: 'baseline',
    name: 'Current Org (Baseline)',
    isBaseline: true,
    createdAt: new Date(),
    nodes,
    rootId: ceoId,
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
