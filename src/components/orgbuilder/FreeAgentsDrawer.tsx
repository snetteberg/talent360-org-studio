import { X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/types/org-builder';

interface FreeAgentsDrawerProps {
  agents: Employee[];
  onClose: () => void;
  onAssign: (employeeId: string) => void;
}

export function FreeAgentsDrawer({ agents, onClose, onAssign }: FreeAgentsDrawerProps) {
  return (
    <div className="w-[320px] bg-card border-l border-border h-full animate-slide-in-right shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Free Agents</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {agents.length} displaced {agents.length === 1 ? 'person' : 'people'}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 72px)' }}>
        {agents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No free agents</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map(agent => (
              <div
                key={agent.id}
                className="p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.department}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.skills.slice(0, 2).map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => onAssign(agent.id)}
                >
                  Find Position
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
