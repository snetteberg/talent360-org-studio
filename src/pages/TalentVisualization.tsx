import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/components/talent360/TopNav';
import { TalentSunburst } from '@/components/talentvis/TalentSunburst';
import { SkillFilter } from '@/components/talentvis/SkillFilter';
import { createBaselineScenario, mockEmployees } from '@/data/mock-org-data';

export default function TalentVisualization() {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const scenario = createBaselineScenario();

  // Get all unique skills from employees
  const allSkills = Array.from(
    new Set(mockEmployees.flatMap(emp => emp.skills))
  ).sort();

  const handleTabChange = (tab: 'workforce' | 'orgbuilder' | 'talentvis') => {
    if (tab === 'workforce') {
      navigate('/');
    } else if (tab === 'orgbuilder') {
      navigate('/orgbuilder');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="talentvis" onTabChange={handleTabChange} />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Talent Visualization
          </h1>
          <p className="text-muted-foreground">
            Explore your organization structure and skill distribution across teams
          </p>
        </div>

        <div className="flex gap-6">
          {/* Skill Filter Sidebar */}
          <div className="w-64 shrink-0">
            <SkillFilter
              skills={allSkills}
              selectedSkill={selectedSkill}
              onSelectSkill={setSelectedSkill}
            />
          </div>

          {/* Sunburst Chart */}
          <div className="flex-1 bg-card rounded-lg border border-border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">
                Organization Sunburst
              </h2>
              {selectedSkill && (
                <span className="text-sm text-muted-foreground">
                  Showing proficiency in: <span className="font-medium text-primary">{selectedSkill}</span>
                </span>
              )}
            </div>
            <TalentSunburst
              scenario={scenario}
              selectedSkill={selectedSkill}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
