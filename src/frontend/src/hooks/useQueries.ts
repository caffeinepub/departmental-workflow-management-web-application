import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Task, Meeting, Reminder, Message, Priority, Notification, Appointment, KanbanBoard, Client, MailNotification, MailSender, WorkflowAutomationRule, AutomationTrigger, AutomationAction, WorkflowAutomationLogEntry, Invoice, InvoiceReminder, EntityCount } from '../backend';
import { AppointmentStatus, InvoiceStatus } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Admin Database Queries
export function useGetAdminData() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const tasksQuery = useQuery<Task[]>({
    queryKey: ['adminTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllTasks();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const clientsQuery = useQuery<Client[]>({
    queryKey: ['adminClients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllClients();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const meetingsQuery = useQuery<Meeting[]>({
    queryKey: ['adminMeetings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllMeetings();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const remindersQuery = useQuery<Reminder[]>({
    queryKey: ['adminReminders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllReminders();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const invoicesQuery = useQuery<Invoice[]>({
    queryKey: ['adminInvoices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllInvoices();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const invoiceRemindersQuery = useQuery<InvoiceReminder[]>({
    queryKey: ['adminInvoiceReminders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllInvoiceReminders();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const appointmentsQuery = useQuery<Appointment[]>({
    queryKey: ['adminAppointments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllAppointments();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const workflowRulesQuery = useQuery<WorkflowAutomationRule[]>({
    queryKey: ['adminWorkflowRules'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllWorkflowRules();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const workflowLogsQuery = useQuery<WorkflowAutomationLogEntry[]>({
    queryKey: ['adminWorkflowLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllWorkflowLogs();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ['adminNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllNotifications();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const mailNotificationsQuery = useQuery<MailNotification[]>({
    queryKey: ['adminMailNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAllMailNotifications();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const entityCountsQuery = useQuery<EntityCount>({
    queryKey: ['adminEntityCounts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminEntityCounts();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  return {
    tasks: tasksQuery.data || [],
    clients: clientsQuery.data || [],
    meetings: meetingsQuery.data || [],
    reminders: remindersQuery.data || [],
    invoices: invoicesQuery.data || [],
    invoiceReminders: invoiceRemindersQuery.data || [],
    appointments: appointmentsQuery.data || [],
    workflowRules: workflowRulesQuery.data || [],
    workflowLogs: workflowLogsQuery.data || [],
    notifications: notificationsQuery.data || [],
    mailNotifications: mailNotificationsQuery.data || [],
    entityCounts: entityCountsQuery.data,
    isLoading: tasksQuery.isLoading || clientsQuery.isLoading || meetingsQuery.isLoading || remindersQuery.isLoading || invoicesQuery.isLoading || appointmentsQuery.isLoading || workflowRulesQuery.isLoading || workflowLogsQuery.isLoading || entityCountsQuery.isLoading,
    error: tasksQuery.error || clientsQuery.error || meetingsQuery.error || remindersQuery.error || invoicesQuery.error || appointmentsQuery.error || workflowRulesQuery.error || workflowLogsQuery.error || entityCountsQuery.error,
  };
}

// Task Queries
export function useGetUserTasks() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      description: string;
      dueDate: bigint;
      priority: Priority;
      clientId?: string | null;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const task: Task = {
        id: params.id,
        title: params.title,
        description: params.description,
        dueDate: params.dueDate,
        priority: params.priority,
        completed: false,
        owner: identity.getPrincipal(),
        clientId: params.clientId || undefined,
      };
      return actor.createTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: string;
      title: string;
      description: string;
      dueDate: bigint;
      priority: Priority;
      completed: boolean;
      clientId?: string | null;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const task: Task = {
        id: params.taskId,
        title: params.title,
        description: params.description,
        dueDate: params.dueDate,
        priority: params.priority,
        completed: params.completed,
        owner: identity.getPrincipal(),
        clientId: params.clientId || undefined,
      };
      return actor.updateTask(params.taskId, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
    },
  });
}

export function useToggleTaskCompletion() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const task = await actor.getTask(taskId);
      const updatedTask: Task = {
        ...task,
        completed: !task.completed,
      };
      return actor.updateTask(taskId, updatedTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
    },
  });
}

// Kanban Board Queries
export function useGetKanbanBoard() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<KanbanBoard>({
    queryKey: ['kanbanBoard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getKanbanBoard();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSaveKanbanBoard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (board: KanbanBoard) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateKanbanBoard(board);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
    },
  });
}

// Meeting Queries
export function useGetUserMeetings() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMeetings();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateMeeting() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      description: string;
      startTime: bigint;
      endTime: bigint;
      participants: Principal[];
      clientId?: string | null;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const meeting: Meeting = {
        id: params.id,
        title: params.title,
        description: params.description,
        startTime: params.startTime,
        endTime: params.endTime,
        participants: params.participants,
        creator: identity.getPrincipal(),
        clientId: params.clientId || undefined,
      };
      return actor.createMeeting(meeting);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['adminMeetings'] });
    },
  });
}

export function useUpdateMeeting() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      meetingId: string;
      title: string;
      description: string;
      startTime: bigint;
      endTime: bigint;
      participants: Principal[];
      clientId?: string | null;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const meeting: Meeting = {
        id: params.meetingId,
        title: params.title,
        description: params.description,
        startTime: params.startTime,
        endTime: params.endTime,
        participants: params.participants,
        creator: identity.getPrincipal(),
        clientId: params.clientId || undefined,
      };
      return actor.updateMeeting(params.meetingId, meeting);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['adminMeetings'] });
    },
  });
}

export function useDeleteMeeting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMeeting(meetingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['adminMeetings'] });
    },
  });
}

// Reminder Queries
export function useGetUserReminders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReminders();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateReminder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; message: string; time: bigint }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const reminder: Reminder = {
        id: params.id,
        message: params.message,
        time: params.time,
        owner: identity.getPrincipal(),
      };
      return actor.createReminder(reminder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['adminReminders'] });
    },
  });
}

export function useUpdateReminder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { reminderId: string; message: string; time: bigint }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const reminder: Reminder = {
        id: params.reminderId,
        message: params.message,
        time: params.time,
        owner: identity.getPrincipal(),
      };
      return actor.updateReminder(params.reminderId, reminder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['adminReminders'] });
    },
  });
}

export function useDeleteReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteReminder(reminderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['adminReminders'] });
    },
  });
}

// Chat Queries
export function useGetUserChatGroups() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<any[]>({
    queryKey: ['chatGroups'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatGroups();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetMessages(groupId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', groupId],
    queryFn: async () => {
      if (!actor || !groupId) return [];
      return actor.getMessages(groupId);
    },
    enabled: !!actor && !actorFetching && !!groupId,
    refetchInterval: 3000,
  });
}

export function useCreateChatGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { groupId: string; members: Principal[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createChatGroup(params.groupId, params.members);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatGroups'] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { groupId: string; content: string }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: params.content,
        sender: identity.getPrincipal(),
        timestamp: BigInt(Date.now() * 1000000),
      };
      return actor.sendMessage(params.groupId, message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Notification Queries
export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 5000,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    },
  });
}

export function useDismissNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    },
  });
}

// Mail Notification Queries
export function useGetMailNotifications() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<MailNotification[]>({
    queryKey: ['mailNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMailNotifications();
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 10000,
  });
}

export function useCreateMailNotification() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sender: MailSender;
      subject: string;
      source: string;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const mail: MailNotification = {
        id: `mail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: params.sender,
        subject: params.subject,
        source: params.source,
        timestamp: BigInt(Date.now() * 1000000),
        user: identity.getPrincipal(),
        read: false,
      };
      return actor.createMailNotification(mail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminMailNotifications'] });
    },
  });
}

export function useMarkMailNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mailId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markMailAsRead(mailId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminMailNotifications'] });
    },
  });
}

export function useDismissMailNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mailId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMailNotification(mailId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminMailNotifications'] });
    },
  });
}

// Appointment Queries
export function useGetUserAppointments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAppointments();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateAppointment() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      clientName: string;
      serviceType: string;
      dateTime: bigint;
      clientId?: string | null;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const appointment: Appointment = {
        id: params.id,
        clientName: params.clientName,
        serviceType: params.serviceType,
        dateTime: params.dateTime,
        status: AppointmentStatus.pending,
        associatedUser: identity.getPrincipal(),
        clientId: params.clientId || undefined,
      };
      return actor.createAppointment(appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      clientName: string;
      serviceType: string;
      dateTime: bigint;
      status: AppointmentStatus;
      clientId?: string | null;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const appointment: Appointment = {
        id: params.id,
        clientName: params.clientName,
        serviceType: params.serviceType,
        dateTime: params.dateTime,
        status: params.status,
        associatedUser: identity.getPrincipal(),
        clientId: params.clientId || undefined,
      };
      return actor.updateAppointment(params.id, appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
    },
  });
}

// Client Queries
export function useGetUserClients() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateClient() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      email: string;
      phone: string;
      company: string;
      notes: string;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const client: Client = {
        id: params.id,
        name: params.name,
        email: params.email,
        phone: params.phone,
        company: params.company,
        notes: params.notes,
        owner: identity.getPrincipal(),
      };
      return actor.createClient(client);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['adminClients'] });
    },
  });
}

export function useUpdateClient() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      email: string;
      phone: string;
      company: string;
      notes: string;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const client: Client = {
        id: params.id,
        name: params.name,
        email: params.email,
        phone: params.phone,
        company: params.company,
        notes: params.notes,
        owner: identity.getPrincipal(),
      };
      return actor.updateClient(params.id, client);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['adminClients'] });
    },
  });
}

export function useDeleteClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteClient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['adminClients'] });
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
      queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['adminMeetings'] });
    },
  });
}

export function useGetTasksByClient(clientId: string | null) {
  const { data: tasks = [] } = useGetUserTasks();
  
  return useQuery<Task[]>({
    queryKey: ['clientTasks', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      return tasks.filter(task => task.clientId === clientId);
    },
    enabled: !!clientId,
  });
}

export function useGetAppointmentsByClient(clientId: string | null) {
  const { data: appointments = [] } = useGetUserAppointments();
  
  return useQuery<Appointment[]>({
    queryKey: ['clientAppointments', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      return appointments.filter(apt => apt.clientId === clientId);
    },
    enabled: !!clientId,
  });
}

// Invoice Queries
export function useGetInvoices() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      clientId: string;
      amount: bigint;
      dueDate: bigint;
      workDescription: string;
    }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const invoice: Invoice = {
        id: params.id,
        clientId: params.clientId,
        amount: params.amount,
        dueDate: params.dueDate,
        status: InvoiceStatus.pending,
        workDescription: params.workDescription,
        owner: identity.getPrincipal(),
      };
      return actor.createInvoice(invoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoiceReminders'] });
      queryClient.invalidateQueries({ queryKey: ['adminInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['adminInvoiceReminders'] });
    },
  });
}

export function usePayInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordInvoicePayment(invoiceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoiceReminders'] });
      queryClient.invalidateQueries({ queryKey: ['adminInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['adminInvoiceReminders'] });
    },
  });
}

export function useGetInvoiceReminders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<InvoiceReminder[]>({
    queryKey: ['invoiceReminders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInvoiceReminders();
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 30000,
  });
}

// Workflow Automation Queries
export function useGetAutomationRules() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<WorkflowAutomationRule[]>({
    queryKey: ['automationRules'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkflowRules();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateAutomationRule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      trigger: AutomationTrigger;
      action: AutomationAction;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const rule: WorkflowAutomationRule = {
        id: params.id,
        trigger: params.trigger,
        action: params.action,
        enabled: true,
      };
      return actor.createWorkflowRule(rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      queryClient.invalidateQueries({ queryKey: ['adminWorkflowRules'] });
    },
  });
}

export function useDeleteAutomationRule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWorkflowRule(ruleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      queryClient.invalidateQueries({ queryKey: ['adminWorkflowRules'] });
    },
  });
}

export function useUpdateRuleState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { ruleId: string; enabled: boolean; rule: WorkflowAutomationRule }) => {
      if (!actor) throw new Error('Actor not available');
      const updatedRule: WorkflowAutomationRule = {
        ...params.rule,
        enabled: params.enabled,
      };
      return actor.updateWorkflowRule(params.ruleId, updatedRule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      queryClient.invalidateQueries({ queryKey: ['adminWorkflowRules'] });
    },
  });
}

export function useGetWorkflowAutomationLogEntries() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<WorkflowAutomationLogEntry[]>({
    queryKey: ['automationLog'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkflowAutomationLogs();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
