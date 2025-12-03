import { useState } from 'react';
import { TopNav } from '@/components/talent360/TopNav';
import { OrgBuilderLanding } from '@/components/orgbuilder/OrgBuilderLanding';
import { OrgBuilderWorkspace } from '@/components/orgbuilder/OrgBuilderWorkspace';
import { ViewMode } from '@/types/org-builder';
import { useNavigate } from 'react-router-dom';

export default function OrgBuilder() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [startedFromBaseline, setStartedFromBaseline] = useState(true);

  const handleTabChange = (tab: 'workforce' | 'orgbuilder') => {
    if (tab === 'workforce') {
      navigate('/');
    }
  };

  const handleStartFromBaseline = () => {
    setStartedFromBaseline(true);
    setViewMode('workspace');
  };

  const handleStartFromBlank = () => {
    setStartedFromBaseline(false);
    setViewMode('workspace');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="orgbuilder" onTabChange={handleTabChange} />
      
      {viewMode === 'landing' ? (
        <OrgBuilderLanding
          onStartFromBaseline={handleStartFromBaseline}
          onStartFromBlank={handleStartFromBlank}
        />
      ) : (
        <OrgBuilderWorkspace initialFromBaseline={startedFromBaseline} />
      )}
    </div>
  );
}
