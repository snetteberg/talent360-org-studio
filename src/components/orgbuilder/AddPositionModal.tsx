import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddPositionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (position: { title: string; description: string; level: string; skills: string[] }) => void;
  parentTitle?: string;
}

const roleLevels = [
  'Professional',
  'Sr Professional',
  'Manager',
  'Director',
  'Sr Director',
  'Executive Director',
  'VP',
];

export function AddPositionModal({ open, onClose, onAdd, parentTitle }: AddPositionModalProps) {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleReset = () => {
    setTitle('');
    setLevel('');
    setDescription('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAICreate = () => {
    if (!title || !level) return;

    setIsCreating(true);
    
    // Simulate AI generation - in production this would call an AI service
    setTimeout(() => {
      const generatedDescription = generateRoleDescription(title, level, description);
      const generatedSkills = generateSkillsForRole(title, level);
      
      onAdd({
        title,
        level,
        description: generatedDescription,
        skills: generatedSkills,
      });
      
      setIsCreating(false);
      handleReset();
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>
          {parentTitle && (
            <p className="text-sm text-muted-foreground">
              Reporting to: {parentTitle}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Role Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Product Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Role Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {roleLevels.map(l => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Role Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the role (optional - AI will expand)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAICreate} 
            disabled={!title || !level || isCreating}
            className="gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Create
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions to simulate AI generation
function generateRoleDescription(title: string, level: string, baseDescription: string): string {
  const levelContext = {
    'Professional': 'individual contributor focused on executing core responsibilities',
    'Sr Professional': 'experienced individual contributor who mentors others and handles complex work',
    'Manager': 'people leader responsible for team performance and development',
    'Director': 'senior leader overseeing multiple teams and driving departmental strategy',
    'Sr Director': 'executive leader with broad organizational impact and strategic ownership',
    'Executive Director': 'C-suite adjacent leader driving enterprise-wide initiatives',
    'VP': 'executive responsible for entire functional areas and organizational direction',
  }[level] || 'professional';

  const baseText = baseDescription 
    ? `${baseDescription} ` 
    : '';

  return `${baseText}As a ${level} ${title}, this role is an ${levelContext}. Key responsibilities include driving results aligned with organizational objectives, collaborating cross-functionally with stakeholders, and ensuring excellence in delivery. This position requires strong communication skills, strategic thinking, and the ability to navigate complex business challenges while maintaining focus on outcomes and continuous improvement.`;
}

function generateSkillsForRole(title: string, level: string): string[] {
  const titleLower = title.toLowerCase();
  
  // Base skills by level
  const levelSkills: Record<string, string[]> = {
    'Professional': ['Communication', 'Problem Solving', 'Time Management'],
    'Sr Professional': ['Mentoring', 'Technical Expertise', 'Project Management'],
    'Manager': ['People Management', 'Performance Coaching', 'Team Building'],
    'Director': ['Strategic Planning', 'Budget Management', 'Executive Communication'],
    'Sr Director': ['Organizational Leadership', 'Change Management', 'Cross-functional Alignment'],
    'Executive Director': ['Enterprise Strategy', 'Board Communication', 'Transformation Leadership'],
    'VP': ['Vision Setting', 'Executive Presence', 'P&L Ownership'],
  };

  // Title-specific skills
  let titleSkills: string[] = [];
  if (titleLower.includes('product')) {
    titleSkills = ['Product Strategy', 'Roadmap Planning', 'User Research'];
  } else if (titleLower.includes('engineer') || titleLower.includes('developer')) {
    titleSkills = ['Software Development', 'System Design', 'Code Review'];
  } else if (titleLower.includes('design')) {
    titleSkills = ['UX Design', 'Visual Design', 'Design Systems'];
  } else if (titleLower.includes('sales')) {
    titleSkills = ['Sales Strategy', 'Client Relations', 'Revenue Growth'];
  } else if (titleLower.includes('marketing')) {
    titleSkills = ['Marketing Strategy', 'Brand Management', 'Campaign Execution'];
  } else if (titleLower.includes('finance') || titleLower.includes('financial')) {
    titleSkills = ['Financial Analysis', 'Forecasting', 'Risk Management'];
  } else if (titleLower.includes('hr') || titleLower.includes('people')) {
    titleSkills = ['Talent Management', 'Employee Relations', 'HR Strategy'];
  } else if (titleLower.includes('operations')) {
    titleSkills = ['Process Optimization', 'Operational Excellence', 'Vendor Management'];
  } else if (titleLower.includes('data') || titleLower.includes('analyst')) {
    titleSkills = ['Data Analysis', 'SQL', 'Business Intelligence'];
  } else {
    titleSkills = ['Domain Expertise', 'Analytical Thinking', 'Stakeholder Management'];
  }

  const baseSkills = levelSkills[level] || levelSkills['Professional'];
  return [...titleSkills.slice(0, 3), ...baseSkills.slice(0, 2)];
}
