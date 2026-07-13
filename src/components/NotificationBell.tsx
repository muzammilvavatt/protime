"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getNotificationsAction, markNotificationsAsReadAction } from "@/actions/notification.actions";

interface AppNotification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifs() {
      const res = await getNotificationsAction();
      setNotifications(res.notifications);
      setUnreadCount(res.notifications.filter((n: AppNotification) => !n.isRead).length);
    }
    fetchNotifs();
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      markNotificationsAsReadAction();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger className="relative inline-flex items-center justify-center rounded-full h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-slate-800">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No new notifications.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                  <p className="text-sm text-slate-800 font-medium leading-snug">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1" suppressHydrationWarning>
                    {new Date(n.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
