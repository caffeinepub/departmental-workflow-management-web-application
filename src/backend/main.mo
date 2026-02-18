import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Bool "mo:core/Bool";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import List "mo:core/List";
import AccessControl "authorization/access-control";

actor {
  // User Profile
  public type UserProfile = {
    name : Text;
    department : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Core Types
  public type Task = {
    id : Text;
    title : Text;
    description : Text;
    dueDate : Time.Time;
    priority : Priority;
    completed : Bool;
    owner : Principal;
    clientId : ?Text;
  };

  public type Priority = {
    #high;
    #medium;
    #low;
  };

  type KanbanColumn = {
    name : Text;
    taskOrder : [Text];
  };

  type KanbanBoard = {
    columns : [KanbanColumn];
    layout : [Text];
  };

  public type Meeting = {
    id : Text;
    title : Text;
    description : Text;
    startTime : Time.Time;
    endTime : Time.Time;
    participants : [Principal];
    creator : Principal;
    clientId : ?Text;
  };

  public type Reminder = {
    id : Text;
    message : Text;
    time : Time.Time;
    owner : Principal;
  };

  public type NotificationType = {
    #reminder;
    #message;
    #mail;
  };

  public type AppointmentStatus = {
    #pending;
    #confirmed;
    #completed;
  };

  public type Message = {
    id : Text;
    content : Text;
    sender : Principal;
    timestamp : Time.Time;
  };

  type ChatGroup = {
    id : Text;
    members : [Principal];
    creator : Principal;
  };

  public type Notification = {
    id : Text;
    notificationType : NotificationType;
    message : Text;
    timestamp : Time.Time;
    read : Bool;
    user : Principal;
    mailNotification : ?MailNotification;
  };

  type MailSender = {
    address : Text;
    displayName : Text;
  };

  public type MailNotification = {
    sender : MailSender;
    subject : Text;
    timestamp : Time.Time;
    source : Text;
    id : Text;
    user : Principal;
    read : Bool;
  };

  public type Appointment = {
    id : Text;
    clientName : Text;
    serviceType : Text;
    dateTime : Time.Time;
    status : AppointmentStatus;
    associatedUser : Principal;
    clientId : ?Text;
  };

  public type Client = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    company : Text;
    notes : Text;
    owner : Principal;
  };

  public type Invoice = {
    id : Text;
    clientId : Text;
    amount : Nat;
    dueDate : Time.Time;
    status : InvoiceStatus;
    workDescription : Text;
    owner : Principal;
  };

  public type InvoiceStatus = {
    #pending;
    #paid;
    #overdue;
  };

  public type InvoiceReminder = {
    id : Text;
    invoiceId : Text;
    userId : Principal;
    dueDate : Time.Time;
    reminderTime : Time.Time;
    message : Text;
  };

  public type AutomationTrigger = {
    #taskCompleted : Text;
    #meetingEnded : Text;
    #clientCreated : Text;
  };

  public type AutomationAction = {
    #createTask : Task;
    #createReminder : Reminder;
    #createMeeting : Meeting;
    #createNotification : Notification;
    #createAppointment : Appointment;
  };

  public type AutomationStatus = {
    #pending;
    #inProgress;
    #completed;
    #failed;
  };

  public type AutomationEvent = {
    id : Text;
    trigger : AutomationTrigger;
    action : Text;
    timestamp : Time.Time;
  };

  public type WorkflowAutomationRule = {
    id : Text;
    trigger : AutomationTrigger;
    action : AutomationAction;
    enabled : Bool;
  };

  public type WorkflowAutomationLogEntry = {
    id : Text;
    event : AutomationEvent;
    ruleId : Text;
    timestamp : Time.Time;
    user : Principal;
    status : AutomationStatus;
  };

  public type ProductivitySummary = {
    overdueTasks : Nat;
    upcomingReminders : Nat;
    activeMeetings : Nat;
    availableSlots : Nat;
  };

  public type SchedulingSuggestions = {
    suggestedMeetings : [Meeting];
    availableTimeBlocks : [Time.Time];
    scheduleResolutions : Text;
  };

  // State initialization and access control
  let accessControlState = AccessControl.initState();
  let tasks = Map.empty<Text, Task>();
  let userKanbanBoards = Map.empty<Principal, KanbanBoard>();
  let meetings = Map.empty<Text, Meeting>();
  let reminders = Map.empty<Text, Reminder>();
  let messages = Map.empty<Text, List.List<Message>>();
  let chatGroups = Map.empty<Text, ChatGroup>();
  let notifications = Map.empty<Text, Notification>();
  let mailNotifications = Map.empty<Text, MailNotification>();
  let appointments = Map.empty<Text, Appointment>();
  let clients = Map.empty<Text, Client>();
  let invoices = Map.empty<Text, Invoice>();
  let invoiceReminders = Map.empty<Text, InvoiceReminder>();
  let workflowAutomationRules = Map.empty<Text, WorkflowAutomationRule>();
  let workflowAutomationLog = Map.empty<Text, WorkflowAutomationLogEntry>();

  // Access Control Functions
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Task Management
  module Task {
    public func compare(a : Task, b : Task) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  public shared ({ caller }) func createTask(task : Task) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };
    if (task.owner != caller) {
      Runtime.trap("Unauthorized: Cannot create tasks for other users");
    };
    tasks.add(task.id, task);
  };

  public query ({ caller }) func getTask(taskId : Text) : async Task {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) {
        if (task.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the task owner or an admin can view this task");
        };
        task;
      };
    };
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    tasks.values().filter(func(task) { task.owner == caller }).toArray();
  };

  public shared ({ caller }) func updateTask(taskId : Text, updatedTask : Task) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) {
        if (task.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the task owner or an admin can update this task");
        };
        if (updatedTask.owner != task.owner) {
          Runtime.trap("Unauthorized: Cannot change task ownership");
        };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) {
        if (task.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the task owner or an admin can delete this task");
        };
        tasks.remove(taskId);
      };
    };
  };

  // Kanban Board Management
  module KanbanColumn {
    public func compare(a : KanbanColumn, b : KanbanColumn) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  public query ({ caller }) func getKanbanBoard() : async KanbanBoard {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get Kanban boards");
    };
    switch (userKanbanBoards.get(caller)) {
      case (null) {
        {
          columns = [];
          layout = [];
        };
      };
      case (?kanbanBoard) { kanbanBoard };
    };
  };

  public shared ({ caller }) func updateKanbanBoard(board : KanbanBoard) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update Kanban boards");
    };
    userKanbanBoards.add(caller, board);
  };

  // Meeting Management
  module Meeting {
    public func compare(a : Meeting, b : Meeting) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  public shared ({ caller }) func createMeeting(meeting : Meeting) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create meetings");
    };
    if (meeting.creator != caller) {
      Runtime.trap("Unauthorized: Cannot create meetings for other users");
    };
    meetings.add(meeting.id, meeting);
  };

  public query ({ caller }) func getMeeting(meetingId : Text) : async Meeting {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view meetings");
    };
    switch (meetings.get(meetingId)) {
      case (null) { Runtime.trap("Meeting does not exist") };
      case (?meeting) {
        var isParticipant = false;
        for (participant in meeting.participants.values()) {
          if (participant == caller) { isParticipant := true };
        };
        if (not isParticipant and meeting.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only meeting participants, creator, or admin can view this meeting");
        };
        meeting;
      };
    };
  };

  public query ({ caller }) func getAllMeetings() : async [Meeting] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view meetings");
    };
    meetings.values().filter(
      func(meeting) {
        var isParticipant = false;
        for (participant in meeting.participants.values()) {
          if (participant == caller) { isParticipant := true };
        };
        meeting.creator == caller or isParticipant;
      }
    ).toArray();
  };

  public shared ({ caller }) func updateMeeting(meetingId : Text, updatedMeeting : Meeting) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update meetings");
    };
    switch (meetings.get(meetingId)) {
      case (null) { Runtime.trap("Meeting does not exist") };
      case (?meeting) {
        if (meeting.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the meeting creator or an admin can update this meeting");
        };
        if (updatedMeeting.creator != meeting.creator) {
          Runtime.trap("Unauthorized: Cannot change meeting creator");
        };
        meetings.add(meetingId, updatedMeeting);
      };
    };
  };

  public shared ({ caller }) func deleteMeeting(meetingId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete meetings");
    };
    switch (meetings.get(meetingId)) {
      case (null) { Runtime.trap("Meeting does not exist") };
      case (?meeting) {
        if (meeting.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the meeting creator or an admin can delete this meeting");
        };
        meetings.remove(meetingId);
      };
    };
  };

  // Reminder Management
  module Reminder {
    public func compare(a : Reminder, b : Reminder) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  public shared ({ caller }) func createReminder(reminder : Reminder) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create reminders");
    };
    if (reminder.owner != caller) {
      Runtime.trap("Unauthorized: Cannot create reminders for other users");
    };
    reminders.add(reminder.id, reminder);
  };

  public query ({ caller }) func getReminder(reminderId : Text) : async Reminder {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view reminders");
    };
    switch (reminders.get(reminderId)) {
      case (null) { Runtime.trap("Reminder does not exist") };
      case (?reminder) {
        if (reminder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the reminder owner or an admin can view this reminder");
        };
        reminder;
      };
    };
  };

  public query ({ caller }) func getAllReminders() : async [Reminder] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view reminders");
    };
    reminders.values().filter(func(reminder) { reminder.owner == caller }).toArray();
  };

  public shared ({ caller }) func updateReminder(reminderId : Text, updatedReminder : Reminder) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update reminders");
    };
    switch (reminders.get(reminderId)) {
      case (null) { Runtime.trap("Reminder does not exist") };
      case (?reminder) {
        if (reminder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the reminder owner or an admin can update this reminder");
        };
        if (updatedReminder.owner != reminder.owner) {
          Runtime.trap("Unauthorized: Cannot change reminder ownership");
        };
        reminders.add(reminderId, updatedReminder);
      };
    };
  };

  public shared ({ caller }) func deleteReminder(reminderId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete reminders");
    };
    switch (reminders.get(reminderId)) {
      case (null) { Runtime.trap("Reminder does not exist") };
      case (?reminder) {
        if (reminder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the reminder owner or an admin can delete this reminder");
        };
        reminders.remove(reminderId);
      };
    };
  };

  // Messaging System
  module Message {
    public func compare(a : Message, b : Message) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  public shared ({ caller }) func createChatGroup(groupId : Text, members : [Principal]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create chat groups");
    };
    let group : ChatGroup = {
      id = groupId;
      members = members;
      creator = caller;
    };
    chatGroups.add(groupId, group);
    messages.add(groupId, List.empty<Message>());
  };

  public shared ({ caller }) func sendMessage(groupId : Text, message : Message) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (message.sender != caller) {
      Runtime.trap("Unauthorized: Cannot send messages as other users");
    };
    switch (chatGroups.get(groupId)) {
      case (null) { Runtime.trap("Chat group does not exist") };
      case (?group) {
        var isMember = false;
        for (member in group.members.values()) {
          if (member == caller) { isMember := true };
        };
        if (not isMember) {
          Runtime.trap("Unauthorized: Only group members can send messages");
        };
        switch (messages.get(groupId)) {
          case (null) {
            messages.add(groupId, List.fromArray<Message>([message]));
          };
          case (?msgList) {
            msgList.add(message);
            messages.add(groupId, msgList);
          };
        };
      };
    };
  };

  public query ({ caller }) func getMessages(groupId : Text) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    switch (chatGroups.get(groupId)) {
      case (null) { Runtime.trap("Chat group does not exist") };
      case (?group) {
        var isMember = false;
        for (member in group.members.values()) {
          if (member == caller) { isMember := true };
        };
        if (not isMember and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only group members or admins can view messages");
        };
        switch (messages.get(groupId)) {
          case (null) { [] };
          case (?msgs) { msgs.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getChatGroups() : async [ChatGroup] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view chat groups");
    };
    chatGroups.values().filter(
      func(group) {
        var isMember = false;
        for (member in group.members.values()) {
          if (member == caller) { isMember := true };
        };
        isMember or group.creator == caller;
      }
    ).toArray();
  };

  // Notification Management
  module Notification {
    public func compare(a : Notification, b : Notification) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  public shared ({ caller }) func createNotification(notification : Notification) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create notifications");
    };
    if (notification.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot create notifications for other users");
    };
    notifications.add(notification.id, notification);
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    notifications.values().filter(func(notification) { notification.user == caller }).toArray();
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification does not exist") };
      case (?notification) {
        if (notification.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only mark your own notifications as read");
        };
        notifications.add(notificationId, { notification with read = true });
      };
    };
  };

  public shared ({ caller }) func deleteNotification(notificationId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete notifications");
    };
    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification does not exist") };
      case (?notification) {
        if (notification.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own notifications");
        };
        notifications.remove(notificationId);
      };
    };
  };

  // Mail Notification Management
  public shared ({ caller }) func createMailNotification(mail : MailNotification) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create mail notifications");
    };
    if (mail.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot create mail notifications for other users");
    };
    mailNotifications.add(mail.id, mail);
  };

  public query ({ caller }) func getMailNotifications() : async [MailNotification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view mail notifications");
    };
    mailNotifications.values().filter(func(mail) { mail.user == caller }).toArray();
  };

  public shared ({ caller }) func markMailAsRead(mailId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark mail as read");
    };
    switch (mailNotifications.get(mailId)) {
      case (null) { Runtime.trap("Mail notification does not exist") };
      case (?mail) {
        if (mail.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only mark your own mail as read");
        };
        mailNotifications.add(mailId, { mail with read = true });
      };
    };
  };

  public shared ({ caller }) func deleteMailNotification(mailId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete mail notifications");
    };
    switch (mailNotifications.get(mailId)) {
      case (null) { Runtime.trap("Mail notification does not exist") };
      case (?mail) {
        if (mail.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own mail notifications");
        };
        mailNotifications.remove(mailId);
      };
    };
  };

  // Client Management
  public shared ({ caller }) func createClient(client : Client) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create clients");
    };
    if (client.owner != caller) {
      Runtime.trap("Unauthorized: Cannot create clients for other users");
    };
    clients.add(client.id, client);
  };

  public query ({ caller }) func getClient(clientId : Text) : async Client {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client does not exist") };
      case (?client) {
        if (client.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the client owner or an admin can view this client");
        };
        client;
      };
    };
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    clients.values().filter(func(client) { client.owner == caller }).toArray();
  };

  public shared ({ caller }) func updateClient(clientId : Text, updatedClient : Client) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update clients");
    };
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client does not exist") };
      case (?client) {
        if (client.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the client owner or an admin can update this client");
        };
        if (updatedClient.owner != client.owner) {
          Runtime.trap("Unauthorized: Cannot change client ownership");
        };
        clients.add(clientId, updatedClient);
      };
    };
  };

  public shared ({ caller }) func deleteClient(clientId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete clients");
    };
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client does not exist") };
      case (?client) {
        if (client.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the client owner or an admin can delete this client");
        };
        clients.remove(clientId);
      };
    };
  };

  // Appointment Management
  public shared ({ caller }) func createAppointment(appointment : Appointment) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create appointments");
    };
    if (appointment.associatedUser != caller) {
      Runtime.trap("Unauthorized: Cannot create appointments for other users");
    };
    appointments.add(appointment.id, appointment);
  };

  public query ({ caller }) func getAppointment(appointmentId : Text) : async Appointment {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view appointments");
    };
    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment does not exist") };
      case (?appointment) {
        if (appointment.associatedUser != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the associated user or an admin can view this appointment");
        };
        appointment;
      };
    };
  };

  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view appointments");
    };
    appointments.values().filter(func(appointment) { appointment.associatedUser == caller }).toArray();
  };

  public shared ({ caller }) func updateAppointment(appointmentId : Text, updatedAppointment : Appointment) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update appointments");
    };
    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment does not exist") };
      case (?appointment) {
        if (appointment.associatedUser != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the associated user or an admin can update this appointment");
        };
        if (updatedAppointment.associatedUser != appointment.associatedUser) {
          Runtime.trap("Unauthorized: Cannot change appointment associated user");
        };
        appointments.add(appointmentId, updatedAppointment);
      };
    };
  };

  public shared ({ caller }) func deleteAppointment(appointmentId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete appointments");
    };
    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment does not exist") };
      case (?appointment) {
        if (appointment.associatedUser != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the associated user or an admin can delete this appointment");
        };
        appointments.remove(appointmentId);
      };
    };
  };

  // Invoice Management
  public shared ({ caller }) func createInvoice(invoice : Invoice) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create invoices");
    };
    if (invoice.owner != caller) {
      Runtime.trap("Unauthorized: Cannot create invoices for other users");
    };
    invoices.add(invoice.id, invoice);
  };

  public query ({ caller }) func getInvoice(invoiceId : Text) : async Invoice {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    switch (invoices.get(invoiceId)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?invoice) {
        if (invoice.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the invoice owner or an admin can view this invoice");
        };
        invoice;
      };
    };
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.values().filter(func(invoice) { invoice.owner == caller }).toArray();
  };

  public shared ({ caller }) func updateInvoice(invoiceId : Text, updatedInvoice : Invoice) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update invoices");
    };
    switch (invoices.get(invoiceId)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?invoice) {
        if (invoice.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the invoice owner or an admin can update this invoice");
        };
        if (updatedInvoice.owner != invoice.owner) {
          Runtime.trap("Unauthorized: Cannot change invoice ownership");
        };
        invoices.add(invoiceId, updatedInvoice);
      };
    };
  };

  public shared ({ caller }) func deleteInvoice(invoiceId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete invoices");
    };
    switch (invoices.get(invoiceId)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?invoice) {
        if (invoice.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the invoice owner or an admin can delete this invoice");
        };
        invoices.remove(invoiceId);
      };
    };
  };

  // Invoice Reminder Management
  public shared ({ caller }) func createInvoiceReminder(reminder : InvoiceReminder) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create invoice reminders");
    };
    if (reminder.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot create invoice reminders for other users");
    };
    invoiceReminders.add(reminder.id, reminder);
  };

  public query ({ caller }) func getInvoiceReminders() : async [InvoiceReminder] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view invoice reminders");
    };
    invoiceReminders.values().filter(func(reminder) { reminder.userId == caller }).toArray();
  };

  public shared ({ caller }) func deleteInvoiceReminder(reminderId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete invoice reminders");
    };
    switch (invoiceReminders.get(reminderId)) {
      case (null) { Runtime.trap("Invoice reminder does not exist") };
      case (?reminder) {
        if (reminder.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own invoice reminders");
        };
        invoiceReminders.remove(reminderId);
      };
    };
  };

  // Workflow Automation Management
  public shared ({ caller }) func createWorkflowRule(rule : WorkflowAutomationRule) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create workflow automation rules");
    };
    workflowAutomationRules.add(rule.id, rule);
  };

  public query ({ caller }) func getWorkflowRule(ruleId : Text) : async WorkflowAutomationRule {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view workflow rules");
    };
    switch (workflowAutomationRules.get(ruleId)) {
      case (null) { Runtime.trap("Workflow rule does not exist") };
      case (?rule) { rule };
    };
  };

  public query ({ caller }) func getAllWorkflowRules() : async [WorkflowAutomationRule] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view workflow rules");
    };
    workflowAutomationRules.values().toArray();
  };

  public shared ({ caller }) func updateWorkflowRule(ruleId : Text, updatedRule : WorkflowAutomationRule) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update workflow automation rules");
    };
    switch (workflowAutomationRules.get(ruleId)) {
      case (null) { Runtime.trap("Workflow rule does not exist") };
      case (?_) {
        workflowAutomationRules.add(ruleId, updatedRule);
      };
    };
  };

  public shared ({ caller }) func deleteWorkflowRule(ruleId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete workflow automation rules");
    };
    switch (workflowAutomationRules.get(ruleId)) {
      case (null) { Runtime.trap("Workflow rule does not exist") };
      case (?_) {
        workflowAutomationRules.remove(ruleId);
      };
    };
  };

  public shared ({ caller }) func logWorkflowAutomation(logEntry : WorkflowAutomationLogEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can log workflow automation");
    };
    if (logEntry.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot log automation for other users");
    };
    workflowAutomationLog.add(logEntry.id, logEntry);
  };

  public query ({ caller }) func getWorkflowAutomationLogs() : async [WorkflowAutomationLogEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view workflow logs");
    };
    workflowAutomationLog.values().filter(func(log) { log.user == caller }).toArray();
  };

  // AI Assistant Functions
  public query ({ caller }) func getProductivitySummary() : async ProductivitySummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view productivity summary");
    };
    let userTasks = tasks.values().filter(func(task) { task.owner == caller }).toArray();
    let userReminders = reminders.values().filter(func(reminder) { reminder.owner == caller }).toArray();
    let userMeetings = meetings.values().filter(
      func(meeting) {
        var isParticipant = false;
        for (participant in meeting.participants.values()) {
          if (participant == caller) { isParticipant := true };
        };
        meeting.creator == caller or isParticipant;
      }
    ).toArray();

    let now = Time.now();
    let overdueTasks = userTasks.filter(func(task) { not task.completed and task.dueDate < now }).size();
    let upcomingReminders = userReminders.filter(func(reminder) { reminder.time > now }).size();
    let activeMeetings = userMeetings.filter(func(meeting) { meeting.startTime > now }).size();
    {
      overdueTasks = overdueTasks;
      upcomingReminders = upcomingReminders;
      activeMeetings = activeMeetings;
      availableSlots = 0;
    };
  };

  public query ({ caller }) func getSchedulingSuggestions() : async SchedulingSuggestions {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view scheduling suggestions");
    };
    {
      suggestedMeetings = [];
      availableTimeBlocks = [];
      scheduleResolutions = "No conflicts detected";
    };
  };

  // Admin Database Dashboard Functions
  public query ({ caller }) func getAdminAllTasks() : async [Task] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    tasks.values().toArray();
  };

  public query ({ caller }) func getAdminAllKanbanBoards() : async [(Principal, KanbanBoard)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };

    userKanbanBoards.toArray();
  };

  public query ({ caller }) func getAdminAllMeetings() : async [Meeting] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    meetings.values().toArray();
  };

  public query ({ caller }) func getAdminAllReminders() : async [Reminder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    reminders.values().toArray();
  };

  public query ({ caller }) func getAdminAllMessages() : async [(Text, [Message])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    messages.toArray().map(
      func((text, list)) {
        (text, list.toArray());
      }
    );
  };

  public query ({ caller }) func getAdminAllChatGroups() : async [ChatGroup] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    chatGroups.values().toArray();
  };

  public query ({ caller }) func getAdminAllNotifications() : async [Notification] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    notifications.values().toArray();
  };

  public query ({ caller }) func getAdminAllMailNotifications() : async [MailNotification] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    mailNotifications.values().toArray();
  };

  public query ({ caller }) func getAdminAllAppointments() : async [Appointment] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    appointments.values().toArray();
  };

  public query ({ caller }) func getAdminAllClients() : async [Client] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    clients.values().toArray();
  };

  public query ({ caller }) func getAdminAllInvoices() : async [Invoice] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    invoices.values().toArray();
  };

  public query ({ caller }) func getAdminAllInvoiceReminders() : async [InvoiceReminder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    invoiceReminders.values().toArray();
  };

  public query ({ caller }) func getAdminAllWorkflowRules() : async [WorkflowAutomationRule] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    workflowAutomationRules.values().toArray();
  };

  public query ({ caller }) func getAdminAllWorkflowLogs() : async [WorkflowAutomationLogEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    workflowAutomationLog.values().toArray();
  };

  public query ({ caller }) func getAdminAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access the full database");
    };
    userProfiles.toArray();
  };

  // Admin Helper Query Functions
  public query ({ caller }) func getAdminTasksByPriority(priority : Priority) : async [Task] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can search database");
    };
    tasks.values().filter(func(t) { t.priority == priority }).toArray();
  };

  public query ({ caller }) func getAdminTasksByCompletion(completed : Bool) : async [Task] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can search database");
    };
    tasks.values().filter(func(t) { t.completed == completed }).toArray();
  };

  public query ({ caller }) func getAdminDueReminders(maxTime : Time.Time) : async [Reminder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can search database");
    };
    reminders.values().filter(func(r) { r.time <= maxTime }).toArray();
  };

  public query ({ caller }) func getAdminPendingInvoices() : async [Invoice] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can search database");
    };
    invoices.values().filter(func(i) { i.status == #pending }).toArray();
  };

  public query ({ caller }) func getAdminUnpaidInvoiceReminders() : async [InvoiceReminder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can search database");
    };
    invoiceReminders.values().filter(
      func(reminder) {
        // Only keep reminders for invoices that are still pending (not paid)
        let invoiceOpt = invoices.get(reminder.invoiceId);
        switch (invoiceOpt) {
          case (null) {
            // If invoice is missing, treat as unpaid
            true;
          };
          case (?invoice) {
            invoice.status != #paid;
          };
        };
      }
    ).toArray();
  };

  // Entity Count Aggregator
  public type EntityCount = {
    tasks : Nat;
    kanbanBoards : Nat;
    meetings : Nat;
    reminders : Nat;
    messages : Nat;
    chatGroups : Nat;
    notifications : Nat;
    mailNotifications : Nat;
    appointments : Nat;
    clients : Nat;
    invoices : Nat;
    invoiceReminders : Nat;
    workflowRules : Nat;
    automationLogs : Nat;
    userProfiles : Nat;
  };

  public query ({ caller }) func getAdminEntityCounts() : async EntityCount {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can count entities");
    };
    {
      tasks = tasks.size();
      kanbanBoards = userKanbanBoards.size();
      meetings = meetings.size();
      reminders = reminders.size();
      messages = messages.size();
      chatGroups = chatGroups.size();
      notifications = notifications.size();
      mailNotifications = mailNotifications.size();
      appointments = appointments.size();
      clients = clients.size();
      invoices = invoices.size();
      invoiceReminders = invoiceReminders.size();
      workflowRules = workflowAutomationRules.size();
      automationLogs = workflowAutomationLog.size();
      userProfiles = userProfiles.size();
    };
  };

  // Admin Validation Functions
  public query ({ caller }) func isDatabaseAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func validateDatabaseAccess() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin access required");
    };
  };

  // Invoice Payment Recording (Admin-only)
  public shared ({ caller }) func recordInvoicePayment(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can record invoice payments");
    };

    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?invoice) {
        invoices.add(id, { invoice with status = #paid });

        let remindersToRemove = invoiceReminders.keys().toArray().filter(
          func(reminderId) {
            switch (invoiceReminders.get(reminderId)) {
              case (?reminder) { reminder.invoiceId == id };
              case (null) { false };
            };
          }
        );

        for (reminderId in remindersToRemove.values()) {
          invoiceReminders.remove(reminderId);
        };
      };
    };
  };
};

