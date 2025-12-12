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
          {/* Skill Filter Sidebar */}
          <div className="w-72 shrink-0">
            <SkillFilter
              selectedSkill={selectedSkill}
              onSelectSkill={setSelectedSkill}
            />
          </div>

          {/* Sunburst Chart */}
          <div className="flex-1 bg-card rounded-lg border border-border p-6 flex flex-col overflow-hidden">
            <div className="mb-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-medium text-foreground">
                Organization Sunburst
              </h2>
              {selectedSkill && (
                <span className="text-sm text-muted-foreground">
                  Showing: <span className="font-medium text-primary">
                    {selectedSkill.type === 'category' 
                      ? `${selectedSkill.skillNames.length} skills (avg)`
                      : selectedSkill.familyName}
                  </span>
                </span>
              )}
            </div>
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
