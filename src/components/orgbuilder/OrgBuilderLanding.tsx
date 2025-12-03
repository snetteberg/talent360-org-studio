import { Building, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrgBuilderLandingProps {
  onStartFromBaseline: () => void;
  onStartFromBlank: () => void;
}

export function OrgBuilderLanding({ onStartFromBaseline, onStartFromBlank }: OrgBuilderLandingProps) {
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Building className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-3">
          Welcome to OrgBuilder
        </h1>
        <p className="text-muted-foreground text-lg">
          Create and evaluate org scenarios with instant insights into available talent, skills, and results.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full">
        <button
          onClick={onStartFromBaseline}
          className="group relative p-8 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Start from Current Org
              </h2>
              <p className="text-sm text-muted-foreground">
                Begin with your existing organizational structure as the baseline. Make changes and compare against the current state.
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Recommended
          </div>
        </button>

        <button
          onClick={onStartFromBlank}
          className="group p-8 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Start from Blank Canvas
              </h2>
              <p className="text-sm text-muted-foreground">
                Design a completely new organizational structure from scratch. Perfect for major restructuring or greenfield initiatives.
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Real-time insights</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Talent matching</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Scenario comparison</span>
        </div>
      </div>
    </div>
  );
}
