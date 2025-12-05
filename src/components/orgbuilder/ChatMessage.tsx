import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/types/org-chat';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onApply?: () => void;
  onClear?: () => void;
  onSelectOption?: (option: string) => void;
}

export function ChatMessage({ message, onApply, onClear, onSelectOption }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Preview Actions */}
        {message.action?.type === 'preview' && (
          <div className="flex gap-2 mt-3 pt-2 border-t border-border/50">
            <Button
              size="sm"
              variant="default"
              className="gap-1.5 h-7 text-xs"
              onClick={onApply}
            >
              <Check className="w-3 h-3" />
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-7 text-xs"
              onClick={onClear}
            >
              <X className="w-3 h-3" />
              Clear
            </Button>
          </div>
        )}

        {/* Clarification Options */}
        {message.action?.type === 'clarification' && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border/50">
            {message.action.options.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onSelectOption?.(opt.label)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        )}

        {/* Error indicator */}
        {message.action?.type === 'error' && (
          <div className="flex items-center gap-1.5 mt-2 text-destructive">
            <AlertCircle className="w-3 h-3" />
            <span className="text-xs">Could not process</span>
          </div>
        )}
      </div>
    </div>
  );
}
