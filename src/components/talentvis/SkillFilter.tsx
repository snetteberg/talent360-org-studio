import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SkillFilterProps {
  skills: string[];
  selectedSkill: string | null;
  onSelectSkill: (skill: string | null) => void;
}

export function SkillFilter({ skills, selectedSkill, onSelectSkill }: SkillFilterProps) {
  const [search, setSearch] = useState('');

  const filteredSkills = skills.filter(skill =>
    skill.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">Filter by Skill</h3>
        {selectedSkill && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectSkill(null)}
            className="h-7 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-1">
          {filteredSkills.map(skill => (
            <button
              key={skill}
              onClick={() => onSelectSkill(selectedSkill === skill ? null : skill)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                selectedSkill === skill
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Proficiency Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-muted-foreground">Expert (90-100%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-muted-foreground">Advanced (70-89%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-muted-foreground">Intermediate (50-69%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-muted-foreground">Beginner (30-49%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-muted" />
            <span className="text-muted-foreground">No skill / Vacant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
