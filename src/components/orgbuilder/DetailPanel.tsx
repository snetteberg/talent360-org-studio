import { X, User, Briefcase, ArrowRight, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OrgNode, Employee, OrgHealth, HealthFlag } from '@/types/org-builder';
import { suggestedCandidates, suggestedRoles } from '@/data/mock-org-data';

interface DetailPanelProps {
  type: 'person' | 'position' | 'health' | 'flag';
  node?: OrgNode;
  health?: OrgHealth;
  flag?: HealthFlag;
  onClose: () => void;
  onReassignPerson?: (nodeId: string) => void;
  onAssignPerson?: (nodeId: string) => void;
  isBaseline: boolean;
}

export function DetailPanel({
  type,
  node,
  health,
  flag,
  onClose,
  onReassignPerson,
  onAssignPerson,
  isBaseline,
}: DetailPanelProps) {
  return (
    <div className="w-[360px] bg-card border-l border-border h-full animate-slide-in-right shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {type === 'person' && 'Person Details'}
          {type === 'position' && 'Position Details'}
          {type === 'health' && 'Organization Health'}
          {type === 'flag' && 'Issue Details'}
        </h3>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
        {type === 'person' && node?.employee && (
          <PersonDetails
            node={node}
            onReassign={() => onReassignPerson?.(node.id)}
            isBaseline={isBaseline}
          />
        )}
        {type === 'position' && node && !node.employee && (
          <PositionDetails
            node={node}
            onAssign={() => onAssignPerson?.(node.id)}
            isBaseline={isBaseline}
          />
        )}
        {type === 'health' && health && <HealthDetails health={health} />}
        {type === 'flag' && flag && <FlagDetails flag={flag} />}
      </div>
    </div>
  );
}

function PersonDetails({
  node,
  onReassign,
  isBaseline,
}: {
  node: OrgNode;
  onReassign: () => void;
  isBaseline: boolean;
}) {
  const employee = node.employee!;
  const roles = suggestedRoles(employee.id);

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
          {employee.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{employee.name}</h4>
          <p className="text-sm text-muted-foreground">{node.position.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{employee.email}</p>
        </div>
      </div>

      {/* Skill Match */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Skill Match</span>
          <span className="text-sm font-semibold text-success">{employee.matchScore}%</span>
        </div>
        <Progress value={employee.matchScore} className="h-2" />
      </div>

      {/* Skills */}
      <div>
        <h5 className="text-sm font-medium text-foreground mb-2">Skills</h5>
        <div className="flex flex-wrap gap-1.5">
          {employee.skills.map(skill => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Suggested Roles */}
      <div>
        <h5 className="text-sm font-medium text-foreground mb-3">Suggested Roles</h5>
        <div className="space-y-2">
          {roles.map(role => (
            <div
              key={role.id}
              className="p-3 bg-secondary/50 rounded-lg flex items-center gap-3"
            >
              <Star className="w-4 h-4 text-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{role.title}</p>
                <p className="text-xs text-muted-foreground">{role.department}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      {!isBaseline && (
        <Button className="w-full gap-2" onClick={onReassign}>
          <ArrowRight className="w-4 h-4" />
          Reassign Person
        </Button>
      )}
    </div>
  );
}

function PositionDetails({
  node,
  onAssign,
  isBaseline,
}: {
  node: OrgNode;
  onAssign: () => void;
  isBaseline: boolean;
}) {
  const candidates = suggestedCandidates(node.position.id);

  return (
    <div className="space-y-6">
      {/* Position Info */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center border-2 border-dashed border-warning/30">
          <Briefcase className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{node.position.title}</h4>
          <p className="text-sm text-muted-foreground">{node.position.department}</p>
          <Badge variant="outline" className="mt-2 text-warning border-warning/30">
            Open Position
          </Badge>
        </div>
      </div>

      {/* Description */}
      <div>
        <h5 className="text-sm font-medium text-foreground mb-2">Description</h5>
        <p className="text-sm text-muted-foreground">{node.position.description}</p>
      </div>

      {/* Required Skills */}
      <div>
        <h5 className="text-sm font-medium text-foreground mb-2">Required Skills</h5>
        <div className="flex flex-wrap gap-1.5">
          {node.position.requiredSkills.map(skill => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Matched Employees */}
      <div>
        <h5 className="text-sm font-medium text-foreground mb-3">Top Matches</h5>
        <div className="space-y-2">
          {candidates.map(emp => (
            <div
              key={emp.id}
              className="p-3 bg-secondary/50 rounded-lg flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {emp.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{emp.name}</p>
                <p className="text-xs text-muted-foreground">{emp.department}</p>
              </div>
              <span className="text-xs font-medium text-success">{emp.matchScore}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      {!isBaseline && (
        <Button className="w-full gap-2" onClick={onAssign}>
          <User className="w-4 h-4" />
          Assign Person
        </Button>
      )}
    </div>
  );
}

function HealthDetails({ health }: { health: OrgHealth }) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-secondary/50 rounded-lg">
          <p className="text-2xl font-semibold text-foreground">{health.headcount}</p>
          <p className="text-xs text-muted-foreground">Headcount</p>
        </div>
        <div className="text-center p-4 bg-secondary/50 rounded-lg">
          <p className="text-2xl font-semibold text-foreground">{health.layers}</p>
          <p className="text-xs text-muted-foreground">Layers</p>
        </div>
        <div className="text-center p-4 bg-secondary/50 rounded-lg">
          <p className="text-2xl font-semibold text-foreground">{health.openPositions}</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
      </div>

      {/* Flags */}
      {health.flags.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-foreground mb-3">Issues</h5>
          <div className="space-y-2">
            {health.flags.map(flag => (
              <div
                key={flag.id}
                className="p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">{flag.message}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{flag.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {health.flags.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-success" />
          </div>
          <p className="text-sm font-medium text-foreground">All Clear</p>
          <p className="text-xs text-muted-foreground mt-1">No organizational issues detected</p>
        </div>
      )}
    </div>
  );
}

function FlagDetails({ flag }: { flag: HealthFlag }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
          <div>
            <p className="font-medium text-foreground">{flag.message}</p>
            <Badge variant="outline" className="mt-2 capitalize text-warning border-warning/30">
              {flag.type} · {flag.severity}
            </Badge>
          </div>
        </div>
      </div>

      <div>
        <h5 className="text-sm font-medium text-foreground mb-2">Affected Nodes</h5>
        <p className="text-sm text-muted-foreground">
          {flag.nodeIds.length} position{flag.nodeIds.length !== 1 ? 's' : ''} involved
        </p>
      </div>

      <Button variant="outline" className="w-full gap-2">
        <AlertTriangle className="w-4 h-4" />
        Highlight on Chart
      </Button>
    </div>
  );
}
