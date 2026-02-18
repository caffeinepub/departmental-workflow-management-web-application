import { useState } from 'react';
import { useGetNotifications, useMarkNotificationAsRead, useDismissNotification, useGetMailNotifications, useMarkMailNotificationAsRead, useDismissMailNotification } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, X, Check, MessageSquare, Clock, Mail } from 'lucide-react';
import { SiGmail } from 'react-icons/si';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '../backend';

interface NotificationCenterProps {
  unreadCount: number;
  onNotificationClick?: (notificationId: string, type: NotificationType) => void;
}

export default function NotificationCenter({ unreadCount, onNotificationClick }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useGetNotifications();
  const { data: mailNotifications = [] } = useGetMailNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const dismiss = useDismissNotification();
  const markMailAsRead = useMarkMailNotificationAsRead();
  const dismissMail = useDismissMailNotification();

  const sortedNotifications = [...notifications].sort((a, b) => {
    return Number(b.timestamp - a.timestamp);
  });

  const sortedMailNotifications = [...mailNotifications].sort((a, b) => {
    return Number(b.timestamp - a.timestamp);
  });

  const unreadMailCount = mailNotifications.filter(m => !m.read).length;
  const unreadSystemCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead.mutateAsync(notificationId);
  };

  const handleDismiss = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dismiss.mutateAsync(notificationId);
  };

  const handleMarkMailAsRead = async (mailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markMailAsRead.mutateAsync(mailId);
  };

  const handleDismissMail = async (mailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dismissMail.mutateAsync(mailId);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification.id, notification.notificationType);
    }
    setOpen(false);
  };

  const handleMailClick = (mail: any) => {
    if (!mail.read) {
      markMailAsRead.mutate(mail.id);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.message:
        return <MessageSquare className="h-4 w-4 text-accent" />;
      case NotificationType.reminder:
        return <Clock className="h-4 w-4 text-secondary" />;
      case NotificationType.mail:
        return <Mail className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getMailProviderBadge = (source: string) => {
    if (source === 'Gmail') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
          <SiGmail className="h-3 w-3" />
          <span className="text-xs font-medium">Gmail</span>
        </div>
      );
    } else if (source === 'Outlook') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
          <Mail className="h-3 w-3" />
          <span className="text-xs font-medium">Outlook</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary">
        <Mail className="h-3 w-3" />
        <span className="text-xs font-medium">{source}</span>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/15 transition-colors"
        >
          <Bell className="h-5 w-5 text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center shadow-summer animate-summer-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-card/95 backdrop-blur-sm border-primary/20" align="end">
        <div className="flex items-center justify-between p-4 border-b border-primary/15">
          <h3 className="font-semibold text-lg text-primary">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground bg-primary/15 px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-primary/10">
            <TabsTrigger value="all" className="relative">
              All
              {unreadCount > 0 && (
                <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="system" className="relative">
              System
              {unreadSystemCount > 0 && (
                <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                  {unreadSystemCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="mail" className="relative">
              Mail
              {unreadMailCount > 0 && (
                <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                  {unreadMailCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px]">
              {sortedNotifications.length === 0 && sortedMailNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-primary/10">
                  {[...sortedNotifications, ...sortedMailNotifications]
                    .sort((a, b) => Number(b.timestamp - a.timestamp))
                    .map((item) => {
                      const isMail = 'sender' in item;
                      if (isMail) {
                        const mail = item;
                        return (
                          <div
                            key={mail.id}
                            className={`p-4 hover:bg-primary/8 transition-colors cursor-pointer ${
                              !mail.read ? 'bg-primary/8' : ''
                            }`}
                            onClick={() => handleMailClick(mail)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-2 rounded-full bg-primary/15">
                                <Mail className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {getMailProviderBadge(mail.source)}
                                </div>
                                <p className={`text-sm ${!mail.read ? 'font-semibold' : ''}`}>
                                  {mail.subject}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  From: {mail.sender.displayName || mail.sender.address}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(Number(mail.timestamp / BigInt(1000000)), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {!mail.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-primary/25"
                                    onClick={(e) => handleMarkMailAsRead(mail.id, e)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-destructive/20"
                                  onClick={(e) => handleDismissMail(mail.id, e)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        const notification = item;
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-primary/8 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-primary/8' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-2 rounded-full bg-primary/15">
                                {getNotificationIcon(notification.notificationType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(Number(notification.timestamp / BigInt(1000000)), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-primary/25"
                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-destructive/20"
                                  onClick={(e) => handleDismiss(notification.id, e)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="system" className="m-0">
            <ScrollArea className="h-[400px]">
              {sortedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No system notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-primary/10">
                  {sortedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-primary/8 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/8' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-full bg-primary/15">
                          {getNotificationIcon(notification.notificationType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(Number(notification.timestamp / BigInt(1000000)), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-primary/25"
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-destructive/20"
                            onClick={(e) => handleDismiss(notification.id, e)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mail" className="m-0">
            <ScrollArea className="h-[400px]">
              {sortedMailNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No mail notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-primary/10">
                  {sortedMailNotifications.map((mail) => (
                    <div
                      key={mail.id}
                      className={`p-4 hover:bg-primary/8 transition-colors cursor-pointer ${
                        !mail.read ? 'bg-primary/8' : ''
                      }`}
                      onClick={() => handleMailClick(mail)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-full bg-primary/15">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getMailProviderBadge(mail.source)}
                          </div>
                          <p className={`text-sm ${!mail.read ? 'font-semibold' : ''}`}>
                            {mail.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            From: {mail.sender.displayName || mail.sender.address}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(Number(mail.timestamp / BigInt(1000000)), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!mail.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-primary/25"
                              onClick={(e) => handleMarkMailAsRead(mail.id, e)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-destructive/20"
                            onClick={(e) => handleDismissMail(mail.id, e)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
