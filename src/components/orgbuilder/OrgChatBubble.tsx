import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OrgChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  hasPreview?: boolean;
}

export function OrgChatBubble({ isOpen, onClick, hasPreview }: OrgChatBubbleProps) {
  if (isOpen) return null;

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-40',
        'transition-all duration-200 hover:scale-105',
        hasPreview && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <MessageSquare className="w-6 h-6" />
      {hasPreview && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
      )}
    </Button>
  );
}
