import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WorkflowAutomationRule {
    id: string;
    action: AutomationAction;
    trigger: AutomationTrigger;
    enabled: boolean;
}
export type Time = bigint;
export interface Meeting {
    id: string;
    startTime: Time;
    title: string;
    creator: Principal;
    participants: Array<Principal>;
    clientId?: string;
    endTime: Time;
    description: string;
}
export interface WorkflowAutomationLogEntry {
    id: string;
    status: AutomationStatus;
    ruleId: string;
    user: Principal;
    event: AutomationEvent;
    timestamp: Time;
}
export interface KanbanColumn {
    name: string;
    taskOrder: Array<string>;
}
export type AutomationAction = {
    __kind__: "createNotification";
    createNotification: Notification;
} | {
    __kind__: "createTask";
    createTask: Task;
} | {
    __kind__: "createMeeting";
    createMeeting: Meeting;
} | {
    __kind__: "createAppointment";
    createAppointment: Appointment;
} | {
    __kind__: "createReminder";
    createReminder: Reminder;
};
export interface Task {
    id: string;
    title: string;
    clientId?: string;
    owner: Principal;
    completed: boolean;
    dueDate: Time;
    description: string;
    priority: Priority;
}
export interface AutomationEvent {
    id: string;
    action: string;
    trigger: AutomationTrigger;
    timestamp: Time;
}
export interface KanbanBoard {
    layout: Array<string>;
    columns: Array<KanbanColumn>;
}
export interface MailNotification {
    id: string;
    subject: string;
    source: string;
    read: boolean;
    user: Principal;
    sender: MailSender;
    timestamp: Time;
}
export interface InvoiceReminder {
    id: string;
    userId: Principal;
    dueDate: Time;
    invoiceId: string;
    reminderTime: Time;
    message: string;
}
export type AutomationTrigger = {
    __kind__: "taskCompleted";
    taskCompleted: string;
} | {
    __kind__: "meetingEnded";
    meetingEnded: string;
} | {
    __kind__: "clientCreated";
    clientCreated: string;
};
export interface Reminder {
    id: string;
    owner: Principal;
    time: Time;
    message: string;
}
export interface MailSender {
    displayName: string;
    address: string;
}
export interface Client {
    id: string;
    owner: Principal;
    name: string;
    email: string;
    company: string;
    notes: string;
    phone: string;
}
export interface ChatGroup {
    id: string;
    creator: Principal;
    members: Array<Principal>;
}
export interface SchedulingSuggestions {
    scheduleResolutions: string;
    availableTimeBlocks: Array<Time>;
    suggestedMeetings: Array<Meeting>;
}
export interface Invoice {
    id: string;
    status: InvoiceStatus;
    clientId: string;
    owner: Principal;
    dueDate: Time;
    workDescription: string;
    amount: bigint;
}
export interface Notification {
    id: string;
    notificationType: NotificationType;
    read: boolean;
    user: Principal;
    message: string;
    timestamp: Time;
    mailNotification?: MailNotification;
}
export interface EntityCount {
    automationLogs: bigint;
    tasks: bigint;
    notifications: bigint;
    meetings: bigint;
    messages: bigint;
    userProfiles: bigint;
    appointments: bigint;
    invoices: bigint;
    invoiceReminders: bigint;
    kanbanBoards: bigint;
    reminders: bigint;
    chatGroups: bigint;
    mailNotifications: bigint;
    clients: bigint;
    workflowRules: bigint;
}
export interface Message {
    id: string;
    content: string;
    sender: Principal;
    timestamp: Time;
}
export interface Appointment {
    id: string;
    status: AppointmentStatus;
    serviceType: string;
    clientId?: string;
    associatedUser: Principal;
    clientName: string;
    dateTime: Time;
}
export interface ProductivitySummary {
    overdueTasks: bigint;
    activeMeetings: bigint;
    availableSlots: bigint;
    upcomingReminders: bigint;
}
export interface UserProfile {
    name: string;
    department: string;
}
export enum AppointmentStatus {
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum AutomationStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress",
    failed = "failed"
}
export enum InvoiceStatus {
    pending = "pending",
    paid = "paid",
    overdue = "overdue"
}
export enum NotificationType {
    reminder = "reminder",
    mail = "mail",
    message = "message"
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAppointment(appointment: Appointment): Promise<void>;
    createChatGroup(groupId: string, members: Array<Principal>): Promise<void>;
    createClient(client: Client): Promise<void>;
    createInvoice(invoice: Invoice): Promise<void>;
    createInvoiceReminder(reminder: InvoiceReminder): Promise<void>;
    createMailNotification(mail: MailNotification): Promise<void>;
    createMeeting(meeting: Meeting): Promise<void>;
    createNotification(notification: Notification): Promise<void>;
    createReminder(reminder: Reminder): Promise<void>;
    createTask(task: Task): Promise<void>;
    createWorkflowRule(rule: WorkflowAutomationRule): Promise<void>;
    deleteAppointment(appointmentId: string): Promise<void>;
    deleteClient(clientId: string): Promise<void>;
    deleteInvoice(invoiceId: string): Promise<void>;
    deleteInvoiceReminder(reminderId: string): Promise<void>;
    deleteMailNotification(mailId: string): Promise<void>;
    deleteMeeting(meetingId: string): Promise<void>;
    deleteNotification(notificationId: string): Promise<void>;
    deleteReminder(reminderId: string): Promise<void>;
    deleteTask(taskId: string): Promise<void>;
    deleteWorkflowRule(ruleId: string): Promise<void>;
    getAdminAllAppointments(): Promise<Array<Appointment>>;
    getAdminAllChatGroups(): Promise<Array<ChatGroup>>;
    getAdminAllClients(): Promise<Array<Client>>;
    getAdminAllInvoiceReminders(): Promise<Array<InvoiceReminder>>;
    getAdminAllInvoices(): Promise<Array<Invoice>>;
    getAdminAllKanbanBoards(): Promise<Array<[Principal, KanbanBoard]>>;
    getAdminAllMailNotifications(): Promise<Array<MailNotification>>;
    getAdminAllMeetings(): Promise<Array<Meeting>>;
    getAdminAllMessages(): Promise<Array<[string, Array<Message>]>>;
    getAdminAllNotifications(): Promise<Array<Notification>>;
    getAdminAllReminders(): Promise<Array<Reminder>>;
    getAdminAllTasks(): Promise<Array<Task>>;
    getAdminAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getAdminAllWorkflowLogs(): Promise<Array<WorkflowAutomationLogEntry>>;
    getAdminAllWorkflowRules(): Promise<Array<WorkflowAutomationRule>>;
    getAdminDueReminders(maxTime: Time): Promise<Array<Reminder>>;
    getAdminEntityCounts(): Promise<EntityCount>;
    getAdminPendingInvoices(): Promise<Array<Invoice>>;
    getAdminTasksByCompletion(completed: boolean): Promise<Array<Task>>;
    getAdminTasksByPriority(priority: Priority): Promise<Array<Task>>;
    getAdminUnpaidInvoiceReminders(): Promise<Array<InvoiceReminder>>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllClients(): Promise<Array<Client>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllMeetings(): Promise<Array<Meeting>>;
    getAllReminders(): Promise<Array<Reminder>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllWorkflowRules(): Promise<Array<WorkflowAutomationRule>>;
    getAppointment(appointmentId: string): Promise<Appointment>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatGroups(): Promise<Array<ChatGroup>>;
    getClient(clientId: string): Promise<Client>;
    getInvoice(invoiceId: string): Promise<Invoice>;
    getInvoiceReminders(): Promise<Array<InvoiceReminder>>;
    getKanbanBoard(): Promise<KanbanBoard>;
    getMailNotifications(): Promise<Array<MailNotification>>;
    getMeeting(meetingId: string): Promise<Meeting>;
    getMessages(groupId: string): Promise<Array<Message>>;
    getNotifications(): Promise<Array<Notification>>;
    getProductivitySummary(): Promise<ProductivitySummary>;
    getReminder(reminderId: string): Promise<Reminder>;
    getSchedulingSuggestions(): Promise<SchedulingSuggestions>;
    getTask(taskId: string): Promise<Task>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkflowAutomationLogs(): Promise<Array<WorkflowAutomationLogEntry>>;
    getWorkflowRule(ruleId: string): Promise<WorkflowAutomationRule>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isDatabaseAdmin(): Promise<boolean>;
    logWorkflowAutomation(logEntry: WorkflowAutomationLogEntry): Promise<void>;
    markMailAsRead(mailId: string): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    recordInvoicePayment(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(groupId: string, message: Message): Promise<void>;
    updateAppointment(appointmentId: string, updatedAppointment: Appointment): Promise<void>;
    updateClient(clientId: string, updatedClient: Client): Promise<void>;
    updateInvoice(invoiceId: string, updatedInvoice: Invoice): Promise<void>;
    updateKanbanBoard(board: KanbanBoard): Promise<void>;
    updateMeeting(meetingId: string, updatedMeeting: Meeting): Promise<void>;
    updateReminder(reminderId: string, updatedReminder: Reminder): Promise<void>;
    updateTask(taskId: string, updatedTask: Task): Promise<void>;
    updateWorkflowRule(ruleId: string, updatedRule: WorkflowAutomationRule): Promise<void>;
    validateDatabaseAccess(): Promise<void>;
}
