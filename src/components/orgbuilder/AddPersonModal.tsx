import { useState } from 'react';
import { Search, Sparkles, UserPlus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockEmployees } from '@/data/mock-org-data';
import { Employee } from '@/types/org-builder';

interface AddPersonModalProps {
  open: boolean;
  onClose: () => void;
  onAddExisting: (employee: Employee) => void;
  onAddNewHire: (name: string, department: string) => void;
  positionTitle?: string;
}

export function AddPersonModal({
  open,
  onClose,
  onAddExisting,
  onAddNewHire,
  positionTitle,
}: AddPersonModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newHireName, setNewHireName] = useState('');
  const [newHireDept, setNewHireDept] = useState('');

  const filteredEmployees = mockEmployees.filter(
    emp =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestedEmployees = mockEmployees
    .filter(emp => emp.matchScore && emp.matchScore > 85)
    .slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add Person</DialogTitle>
          {positionTitle && (
            <p className="text-sm text-muted-foreground">
              Assigning to: {positionTitle}
            </p>
          )}
        </DialogHeader>

        <Tabs defaultValue="search" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search Employees</TabsTrigger>
            <TabsTrigger value="new">Add Placeholder</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 pt-4">
            {/* AI Suggestions */}
            {suggestedEmployees.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">AI Suggestions</span>
                </div>
                <div className="space-y-2">
                  {suggestedEmployees.map(emp => (
                    <button
                      key={emp.id}
                      className="w-full p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3 hover:bg-primary/10 transition-colors text-left"
                      onClick={() => {
                        onAddExisting(emp);
                        onClose();
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.department}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {emp.matchScore}% match
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="space-y-2">
              <Label>Search All Employees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Results */}
            {searchQuery && (
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    className="w-full p-3 bg-secondary/50 rounded-lg flex items-center gap-3 hover:bg-secondary transition-colors text-left"
                    onClick={() => {
                      onAddExisting(emp);
                      onClose();
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                  </button>
                ))}
                {filteredEmployees.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No employees found
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Name / Placeholder Title</Label>
              <Input
                id="newName"
                value={newHireName}
                onChange={e => setNewHireName(e.target.value)}
                placeholder="e.g., New Hire - Engineering"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDept">Department</Label>
              <Input
                id="newDept"
                value={newHireDept}
                onChange={e => setNewHireDept(e.target.value)}
                placeholder="e.g., Technology"
              />
            </div>

            <Button
              className="w-full gap-2"
              disabled={!newHireName}
              onClick={() => {
                onAddNewHire(newHireName, newHireDept);
                onClose();
              }}
            >
              <UserPlus className="w-4 h-4" />
              Add Placeholder
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
