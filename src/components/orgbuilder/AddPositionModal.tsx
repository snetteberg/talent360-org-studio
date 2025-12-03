import { useState } from 'react';
import { Sparkles } from 'lucide-react';
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
  onAdd: (position: { title: string; description: string; department: string }) => void;
  parentTitle?: string;
}

const roleTemplates = [
  { id: 'custom', label: 'Custom Role' },
  { id: 'manager', label: 'Manager Template' },
  { id: 'director', label: 'Director Template' },
  { id: 'analyst', label: 'Analyst Template' },
  { id: 'engineer', label: 'Engineer Template' },
];

const departments = [
  'Executive',
  'Technology',
  'Operations',
  'Finance',
  'HR',
  'Sales',
  'Marketing',
  'Legal',
];

export function AddPositionModal({ open, onClose, onAdd, parentTitle }: AddPositionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [template, setTemplate] = useState('custom');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    if (value === 'manager') {
      setTitle('Manager');
      setDescription('Lead and manage a team to achieve departmental objectives.');
    } else if (value === 'director') {
      setTitle('Director');
      setDescription('Oversee multiple teams and drive strategic initiatives.');
    } else if (value === 'analyst') {
      setTitle('Analyst');
      setDescription('Analyze data and provide insights to support decision-making.');
    } else if (value === 'engineer') {
      setTitle('Engineer');
      setDescription('Design, develop, and maintain technical solutions.');
    }
  };

  const handleGenerateDescription = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setDescription(
        `Lead and coordinate ${title || 'team'} initiatives, ensuring alignment with organizational goals. Drive performance through effective management, stakeholder collaboration, and continuous improvement.`
      );
      setIsGenerating(false);
    }, 1000);
  };

  const handleSubmit = () => {
    if (title && department) {
      onAdd({ title, description, department });
      setTitle('');
      setDescription('');
      setDepartment('');
      setTemplate('custom');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
            <Label htmlFor="template">Role Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {roleTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Role Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Senior Product Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {departments.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 h-7 text-xs"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the role responsibilities..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !department}>
            Add Position
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
