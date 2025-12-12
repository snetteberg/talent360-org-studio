import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/components/talent360/TopNav';
import { TalentSunburst } from '@/components/talentvis/TalentSunburst';
import { SkillFilter, SkillSelection } from '@/components/talentvis/SkillFilter';
import { createBaselineScenario } from '@/data/mock-org-data';

export default function TalentVisualization() {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<SkillSelection | null>(null);
  const scenario = createBaselineScenario();

  const handleTabChange = (tab: 'workforce' | 'orgbuilder' | 'talentvis') => {
    if (tab === 'workforce') {
      navigate('/');
    } else if (tab === 'orgbuilder') {
      navigate('/orgbuilder');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopNav activeTab="talentvis" onTabChange={handleTabChange} />
      
      <main className="flex-1 container mx-auto px-6 py-6 flex flex-col overflow-hidden">
        <div className="mb-4 shrink-0">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Talent Visualization
          </h1>
          <p className="text-muted-foreground">
            Explore skill distributions across your organization's spans and layers
          </p>
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Skill Filter Sidebar - 1/3 width */}
          <div className="w-1/3 shrink-0">
            <SkillFilter
              selectedSkill={selectedSkill}
              onSelectSkill={setSelectedSkill}
            />
          </div>

          {/* Sunburst Chart - 2/3 width */}
          <div className="w-2/3 bg-card rounded-lg border border-border p-6 flex flex-col overflow-hidden">
            <h2 className="text-lg font-medium text-foreground mb-4 shrink-0">
              Organization Sunburst
            </h2>
            <div className="flex-1 min-h-0">
              <TalentSunburst
                scenario={scenario}
                selectedSkills={selectedSkill?.skillNames || null}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
