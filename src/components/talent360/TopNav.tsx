import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface TopNavProps {
  activeTab: 'workforce' | 'orgbuilder' | 'talentvis';
  onTabChange: (tab: 'workforce' | 'orgbuilder' | 'talentvis') => void;
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <header className="bg-nav text-nav-foreground">
      {/* Main Title Bar */}
      <div className="border-b border-nav-foreground/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nav-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-nav" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Talent360</h1>
              <p className="text-xs text-nav-foreground/60">Workforce Intelligence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-nav-foreground/10 flex items-center justify-center text-sm font-medium">
              SC
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <nav className="container mx-auto px-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('workforce')}
            className={cn(
              'nav-tab',
              activeTab === 'workforce' && 'nav-tab-active'
            )}
          >
            Workforce Planning & Succession
          </button>
          <button
            onClick={() => onTabChange('orgbuilder')}
            className={cn(
              'nav-tab',
              activeTab === 'orgbuilder' && 'nav-tab-active'
            )}
          >
            OrgBuilder
          </button>
          <button
            onClick={() => onTabChange('talentvis')}
            className={cn(
              'nav-tab',
              activeTab === 'talentvis' && 'nav-tab-active'
            )}
          >
            Talent Visualization
          </button>
        </div>
      </nav>
    </header>
  );
}
