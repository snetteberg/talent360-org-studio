import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonsProps {
  onAddPosition: () => void;
  onAddPerson: () => void;
  disabled?: boolean;
}

export function FloatingActionButtons({
  onAddPosition,
  onAddPerson,
  disabled,
}: FloatingActionButtonsProps) {
  if (disabled) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
      <Button
        variant="default"
        size="lg"
        className="gap-2 shadow-lg"
        onClick={onAddPosition}
      >
        <Plus className="w-5 h-5" />
        <span>Position</span>
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className="gap-2 shadow-lg"
        onClick={onAddPerson}
      >
        <UserPlus className="w-5 h-5" />
        <span>Person</span>
      </Button>
    </div>
  );
}
