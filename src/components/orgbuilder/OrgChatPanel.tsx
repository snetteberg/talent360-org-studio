import { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatMessage as ChatMessageType } from '@/types/org-chat';
import { cn } from '@/lib/utils';

interface OrgChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageType[];
  isProcessing: boolean;
  hasPreview: boolean;
  onSendMessage: (message: string) => void;
  onApplyPreview: () => void;
  onClearPreview: () => void;
  onClearChat: () => void;
  onSelectOption: (option: string) => void;
}

export function OrgChatPanel({
  isOpen,
  onClose,
  messages,
  isProcessing,
  hasPreview,
  onSendMessage,
  onApplyPreview,
  onClearPreview,
  onClearChat,
  onSelectOption,
}: OrgChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30',
        'transition-transform duration-300 ease-out',
        isOpen ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{ height: '400px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">Org Assistant</h3>
          {hasPreview && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Preview active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClearChat}
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" style={{ height: 'calc(400px - 120px)' }}>
        <div ref={scrollRef} className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <p className="mb-2">Hi! I can help you modify the org chart.</p>
              <p className="text-xs">Try commands like:</p>
              <ul className="text-xs mt-2 space-y-1">
                <li>"Create a Design team under the CTO with 4 people"</li>
                <li>"Add a Product Manager position under the COO"</li>
                <li>"Move VP of Sales under the CEO"</li>
                <li>"Remove the Director of DevOps position"</li>
              </ul>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onApply={onApplyPreview}
              onClear={onClearPreview}
              onSelectOption={onSelectOption}
            />
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isProcessing}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
