import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Workflow, Plus, Trash2, Power, PowerOff, Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useGetAutomationRules, useCreateAutomationRule, useDeleteAutomationRule, useUpdateRuleState, useGetWorkflowAutomationLogEntries, useIsCallerAdmin } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { AutomationTrigger, AutomationAction } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AutomationStatus } from '../backend';

export default function WorkflowAutomation() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: rules = [], isLoading: rulesLoading } = useGetAutomationRules();
  const { data: logEntries = [], isLoading: logLoading } = useGetWorkflowAutomationLogEntries();
  const { mutate: createRule, isPending: isCreating } = useCreateAutomationRule();
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteAutomationRule();
  const { mutate: updateRuleState, isPending: isUpdating } = useUpdateRuleState();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<'taskCompleted' | 'meetingEnded' | 'clientCreated'>('taskCompleted');
  const [actionType, setActionType] = useState<'createReminder' | 'createTask' | 'createMeeting'>('createReminder');

  const isLoading = rulesLoading || adminLoading;

  const handleCreateRule = () => {
    const ruleId = `rule-${Date.now()}`;
    
    const trigger: AutomationTrigger = {
      __kind__: triggerType,
      [triggerType]: 'any',
    } as AutomationTrigger;

    let action: AutomationAction;
    
    if (actionType === 'createReminder') {
      action = {
        __kind__: 'createReminder',
        createReminder: {
          id: `auto-${Date.now()}`,
          message: 'Auto-generated reminder',
          time: BigInt(Date.now() * 1000000),
          owner: null as any,
        },
      };
    } else if (actionType === 'createTask') {
      action = {
        __kind__: 'createTask',
        createTask: {
          id: `auto-${Date.now()}`,
          title: 'Auto-generated task',
          description: 'Created by automation',
          dueDate: BigInt(Date.now() * 1000000),
          priority: { __kind__: 'medium' } as any,
          completed: false,
          owner: null as any,
          clientId: undefined,
        },
      };
    } else {
      action = {
        __kind__: 'createMeeting',
        createMeeting: {
          id: `auto-${Date.now()}`,
          title: 'Auto-generated meeting',
          description: 'Created by automation',
          startTime: BigInt(Date.now() * 1000000),
          endTime: BigInt((Date.now() + 3600000) * 1000000),
          participants: [],
          creator: null as any,
          clientId: undefined,
        },
      };
    }

    createRule(
      { id: ruleId, trigger, action },
      {
        onSuccess: () => {
          toast.success('Automation rule created successfully');
          setIsDialogOpen(false);
        },
        onError: (error) => {
          toast.error(`Failed to create rule: ${error.message}`);
        },
      }
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    deleteRule(ruleId, {
      onSuccess: () => {
        toast.success('Automation rule deleted');
      },
      onError: (error) => {
        toast.error(`Failed to delete rule: ${error.message}`);
      },
    });
  };

  const handleToggleRule = (ruleId: string, enabled: boolean, rule: any) => {
    updateRuleState(
      { ruleId, enabled: !enabled, rule },
      {
        onSuccess: () => {
          toast.success(`Rule ${!enabled ? 'enabled' : 'disabled'}`);
        },
        onError: (error) => {
          toast.error(`Failed to update rule: ${error.message}`);
        },
      }
    );
  };

  const getTriggerLabel = (trigger: AutomationTrigger) => {
    switch (trigger.__kind__) {
      case 'taskCompleted':
        return 'Task Completed';
      case 'meetingEnded':
        return 'Meeting Ended';
      case 'clientCreated':
        return 'Client Created';
      default:
        return 'Unknown';
    }
  };

  const getActionLabel = (action: AutomationAction) => {
    switch (action.__kind__) {
      case 'createTask':
        return 'Create Task';
      case 'createReminder':
        return 'Create Reminder';
      case 'createMeeting':
        return 'Create Meeting';
      case 'createNotification':
        return 'Create Notification';
      case 'createAppointment':
        return 'Create Appointment';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: AutomationStatus) => {
    switch (status) {
      case AutomationStatus.completed:
        return <CheckCircle2 className="h-4 w-4 text-summer-seafoam" />;
      case AutomationStatus.inProgress:
        return <Clock className="h-4 w-4 text-accent" />;
      case AutomationStatus.failed:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: AutomationStatus): "default" | "destructive" | "secondary" => {
    switch (status) {
      case AutomationStatus.completed:
        return 'default';
      case AutomationStatus.failed:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (adminLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-destructive/20 animate-in fade-in duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Only administrators can access workflow automation settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-summer-seafoam to-summer-seafoam/80 flex items-center justify-center shadow-glow-primary">
            <Workflow className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Workflow Automation</h2>
            <p className="text-muted-foreground">Configure rule-based triggers and actions</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-glow-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-md border-primary/20 shadow-summer-lg">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
              <DialogDescription>Define a trigger and action for automated workflows</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select value={triggerType} onValueChange={(value: any) => setTriggerType(value)}>
                  <SelectTrigger className="border-primary/20 focus:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taskCompleted">Task Completed</SelectItem>
                    <SelectItem value="meetingEnded">Meeting Ended</SelectItem>
                    <SelectItem value="clientCreated">Client Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={actionType} onValueChange={(value: any) => setActionType(value)}>
                  <SelectTrigger className="border-primary/20 focus:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createReminder">Create Reminder</SelectItem>
                    <SelectItem value="createTask">Create Follow-up Task</SelectItem>
                    <SelectItem value="createMeeting">Create Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRule} disabled={isCreating} className="bg-primary hover:bg-primary/90">
                {isCreating ? 'Creating...' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Rules */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/15 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Active Automation Rules
          </CardTitle>
          <CardDescription>Manage your workflow automation rules</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No automation rules configured yet</p>
              <p className="text-sm mt-1">Create your first rule to automate workflows</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all hover:shadow-glow-primary"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {rule.enabled ? (
                        <Power className="h-5 w-5 text-primary" />
                      ) : (
                        <PowerOff className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-primary/10 border-primary/20">
                          {getTriggerLabel(rule.trigger)}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline" className="bg-accent/10 border-accent/20">
                          {getActionLabel(rule.action)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Rule ID: {rule.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggleRule(rule.id, rule.enabled, rule)}
                      disabled={isUpdating}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation History */}
      <Card className="bg-card/50 backdrop-blur-sm border-secondary/15 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            Automation History
          </CardTitle>
          <CardDescription>Recent automation executions and activity log</CardDescription>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No automation activity yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {logEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(entry.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{entry.event.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTriggerLabel(entry.event.trigger)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(entry.status)}>
                      {entry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
