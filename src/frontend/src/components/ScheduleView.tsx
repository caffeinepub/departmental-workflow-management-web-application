import { useState } from 'react';
import { useGetUserMeetings, useCreateMeeting, useUpdateMeeting, useDeleteMeeting } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Pencil, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import type { Meeting } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

export default function ScheduleView() {
  const { data: meetings = [], isLoading } = useGetUserMeetings();
  const { identity } = useInternetIdentity();
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participants: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      participants: '',
    });
    setEditingMeeting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const startTime = BigInt(new Date(formData.startTime).getTime() * 1000000);
      const endTime = BigInt(new Date(formData.endTime).getTime() * 1000000);

      // Parse participants (comma-separated principal IDs)
      const participantIds = formData.participants
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const participants: Principal[] = [];
      for (const id of participantIds) {
        try {
          participants.push(Principal.fromText(id));
        } catch {
          toast.error(`Invalid principal ID: ${id}`);
          return;
        }
      }

      // Add current user if not in list
      if (identity && !participants.some(p => p.toString() === identity.getPrincipal().toString())) {
        participants.push(identity.getPrincipal());
      }

      if (editingMeeting) {
        await updateMeeting.mutateAsync({
          meetingId: editingMeeting.id,
          title: formData.title,
          description: formData.description,
          startTime,
          endTime,
          participants,
        });
        toast.success('Meeting updated successfully');
      } else {
        const id = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await createMeeting.mutateAsync({
          id,
          title: formData.title,
          description: formData.description,
          startTime,
          endTime,
          participants,
        });
        toast.success('Meeting created successfully');
      }

      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingMeeting ? 'Failed to update meeting' : 'Failed to create meeting');
      console.error(error);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      startTime: format(Number(meeting.startTime) / 1000000, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(Number(meeting.endTime) / 1000000, "yyyy-MM-dd'T'HH:mm"),
      participants: meeting.participants.map(p => p.toString()).join(', '),
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (meetingId: string) => {
    try {
      await deleteMeeting.mutateAsync(meetingId);
      toast.success('Meeting deleted successfully');
    } catch (error) {
      toast.error('Failed to delete meeting');
      console.error(error);
    }
  };

  // Calendar logic
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getMeetingsForDay = (day: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(Number(meeting.startTime) / 1000000);
      return isSameDay(meetingDate, day);
    });
  };

  const todayMeetings = getMeetingsForDay(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
          <p className="text-muted-foreground">Manage your meetings and calendar</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMeeting ? 'Edit Meeting' : 'Create New Meeting'}</DialogTitle>
              <DialogDescription>
                {editingMeeting ? 'Update meeting details' : 'Schedule a new meeting'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Meeting title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Meeting description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants">Participants (Principal IDs, comma-separated)</Label>
                <Textarea
                  id="participants"
                  value={formData.participants}
                  onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                  placeholder="principal-id-1, principal-id-2, ..."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Enter participant principal IDs separated by commas. You will be automatically added.
                </p>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMeeting.isPending || updateMeeting.isPending}>
                  {(createMeeting.isPending || updateMeeting.isPending) ? 'Saving...' : editingMeeting ? 'Update Meeting' : 'Create Meeting'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(selectedDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const dayMeetings = getMeetingsForDay(day);
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] p-2 rounded-lg border text-left transition-colors
                      ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                      ${isTodayDate ? 'border-primary bg-primary/5' : 'border-border'}
                      ${isSameDay(day, selectedDate) ? 'ring-2 ring-primary' : ''}
                      hover:bg-accent
                    `}
                  >
                    <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    {dayMeetings.length > 0 && (
                      <div className="space-y-1">
                        {dayMeetings.slice(0, 2).map(meeting => (
                          <div
                            key={meeting.id}
                            className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded truncate"
                          >
                            {format(Number(meeting.startTime) / 1000000, 'HH:mm')} {meeting.title}
                          </div>
                        ))}
                        {dayMeetings.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayMeetings.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Meetings</CardTitle>
            <CardDescription>{format(new Date(), 'EEEE, MMMM d')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : todayMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No meetings scheduled for today
              </p>
            ) : (
              <div className="space-y-3">
                {todayMeetings.map(meeting => (
                  <div key={meeting.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm">{meeting.title}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(meeting)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(meeting.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(Number(meeting.startTime) / 1000000, 'HH:mm')} - {format(Number(meeting.endTime) / 1000000, 'HH:mm')}
                    </div>
                    {meeting.description && (
                      <p className="text-xs text-muted-foreground">{meeting.description}</p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle>All Meetings</CardTitle>
          <CardDescription>Complete list of scheduled meetings</CardDescription>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No meetings scheduled. Create your first meeting to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {meetings
                .sort((a, b) => Number(a.startTime) - Number(b.startTime))
                .map(meeting => (
                  <div key={meeting.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{meeting.title}</h3>
                        </div>
                        {meeting.description && (
                          <p className="text-sm text-muted-foreground">{meeting.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>
                            {format(Number(meeting.startTime) / 1000000, 'PPp')}
                          </span>
                          <span>-</span>
                          <span>
                            {format(Number(meeting.endTime) / 1000000, 'p')}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(meeting)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(meeting.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
