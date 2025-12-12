export interface SkillFamily {
  id: string;
  name: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  families: SkillFamily[];
}

export const skillHierarchy: SkillCategory[] = [
  {
    id: 'strategy-innovation',
    name: 'Strategy and Innovation',
    families: [
      { id: 'portfolio-analysis', name: 'Portfolio Analysis' },
      { id: 'competitive-intelligence', name: 'Competitive Intelligence' },
      { id: 'innovation-management', name: 'Innovation Management' },
      { id: 'strategic-planning', name: 'Strategic Planning' },
      { id: 'market-research', name: 'Market Research' },
    ],
  },
  {
    id: 'operations-execution',
    name: 'Operations and Execution',
    families: [
      { id: 'process-optimization', name: 'Process Optimization' },
      { id: 'supply-chain-mgmt', name: 'Supply Chain Management' },
      { id: 'quality-assurance', name: 'Quality Assurance' },
      { id: 'project-management', name: 'Project Management' },
      { id: 'resource-allocation', name: 'Resource Allocation' },
    ],
  },
  {
    id: 'commercial-financial',
    name: 'Commercial and Financial',
    families: [
      { id: 'financial-modeling', name: 'Financial Modeling' },
      { id: 'revenue-management', name: 'Revenue Management' },
      { id: 'pricing-strategy', name: 'Pricing Strategy' },
      { id: 'business-development', name: 'Business Development' },
      { id: 'contract-negotiation', name: 'Contract Negotiation' },
    ],
  },
  {
    id: 'regulatory-political',
    name: 'Regulatory and Political',
    families: [
      { id: 'compliance-management', name: 'Compliance Management' },
      { id: 'government-relations', name: 'Government Relations' },
      { id: 'policy-analysis', name: 'Policy Analysis' },
      { id: 'risk-assessment', name: 'Risk Assessment' },
      { id: 'stakeholder-engagement', name: 'Stakeholder Engagement' },
    ],
  },
  {
    id: 'transformation-leadership',
    name: 'Transformation Leadership',
    families: [
      { id: 'change-management', name: 'Change Management' },
      { id: 'digital-transformation', name: 'Digital Transformation' },
      { id: 'organizational-design', name: 'Organizational Design' },
      { id: 'talent-development', name: 'Talent Development' },
      { id: 'culture-building', name: 'Culture Building' },
    ],
  },
];

// Helper to get all skill family names
export const getAllSkillFamilies = (): string[] => {
  return skillHierarchy.flatMap(cat => cat.families.map(f => f.name));
};

// Helper to get skill families by category
export const getSkillFamiliesByCategory = (categoryId: string): string[] => {
  const category = skillHierarchy.find(c => c.id === categoryId);
  return category ? category.families.map(f => f.name) : [];
};
