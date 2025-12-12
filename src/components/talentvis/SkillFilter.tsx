import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { skillHierarchy, SkillCategory } from '@/data/skill-hierarchy';

export interface SkillSelection {
  type: 'category' | 'family';
  categoryId?: string;
  familyName?: string;
  skillNames: string[]; // The actual skill names to filter by
}

interface SkillFilterProps {
  selectedSkill: SkillSelection | null;
  onSelectSkill: (skill: SkillSelection | null) => void;
}

export function SkillFilter({ selectedSkill, onSelectSkill }: SkillFilterProps) {
  const [search, setSearch] = useState('');

  const handleCategoryClick = (category: SkillCategory) => {
    // If same category is selected, deselect
    if (selectedSkill?.type === 'category' && selectedSkill.categoryId === category.id) {
      onSelectSkill(null);
      return;
    }
    
    onSelectSkill({
      type: 'category',
      categoryId: category.id,
      skillNames: category.families.map(f => f.name),
    });
  };

  const handleFamilyClick = (category: SkillCategory, familyName: string) => {
    // If same family is selected, deselect
    if (selectedSkill?.type === 'family' && selectedSkill.familyName === familyName) {
      onSelectSkill(null);
      return;
    }
    
    onSelectSkill({
      type: 'family',
      categoryId: category.id,
      familyName,
      skillNames: [familyName],
    });
  };

  const isCategorySelected = (categoryId: string) => {
    return selectedSkill?.type === 'category' && selectedSkill.categoryId === categoryId;
  };

  const isFamilySelected = (familyName: string) => {
    return selectedSkill?.type === 'family' && selectedSkill.familyName === familyName;
  };

  const isFamilyInSelectedCategory = (categoryId: string) => {
    return selectedSkill?.type === 'category' && selectedSkill.categoryId === categoryId;
  };

  // Filter families based on search
  const searchLower = search.toLowerCase();
  const filteredHierarchy = search
    ? skillHierarchy.map(cat => ({
        ...cat,
        families: cat.families.filter(f => 
          f.name.toLowerCase().includes(searchLower)
        ),
        matchesCategory: cat.name.toLowerCase().includes(searchLower),
      })).filter(cat => cat.families.length > 0 || cat.matchesCategory)
    : skillHierarchy.map(cat => ({ ...cat, matchesCategory: false }));

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col w-full h-full">
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

      <ScrollArea className="flex-1">
        <div className="border border-border rounded-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr] bg-muted/50 border-b border-border">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Skill Category
            </div>
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-l border-border">
              Skill Family
            </div>
          </div>
          
          {/* Body */}
          {filteredHierarchy.map((category) => (
            <div key={category.id} className="border-b border-border last:border-b-0">
              {category.families.map((family, familyIdx) => (
                <div 
                  key={family.id} 
                  className="grid grid-cols-[1fr_1fr]"
                >
                  {/* Category cell - only show on first row, spans all family rows visually */}
                  <div
                    className={cn(
                      'px-3 py-1.5 text-sm transition-colors cursor-pointer',
                      familyIdx === 0 ? 'border-t-0' : 'border-t border-transparent',
                      isCategorySelected(category.id)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted/50 text-foreground',
                    )}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {familyIdx === 0 ? category.name : ''}
                  </div>
                  
                  {/* Family cell */}
                  <div
                    className={cn(
                      'px-3 py-1.5 text-sm border-l border-border transition-colors cursor-pointer',
                      isFamilySelected(family.name)
                        ? 'bg-primary text-primary-foreground font-medium'
                        : isFamilyInSelectedCategory(category.id)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/50 text-foreground',
                    )}
                    onClick={() => handleFamilyClick(category, family.name)}
                  >
                    {family.name}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
