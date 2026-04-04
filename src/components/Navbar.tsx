import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, LogOut, Briefcase, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Notification } from "@/lib/types";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/api/notifications");
        setNotifications(res.data);
      } catch {
        // ignore
      }
    };
    fetchNotifs();
  }, [isAuthenticated]);

  // Real-time notifications via socket
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    const handleNotif = (notif: any) => {
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          userId: user?.id || "",
          title: notif.title,
          message: notif.message,
          type: notif.type || "system",
          read: false,
          createdAt: "Just now",
        },
        ...prev,
      ]);
    };
    socket.on("notification", handleNotif);
    return () => {
      socket.off("notification", handleNotif);
    };
  }, [isAuthenticated, user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      // Mark all as read locally
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // Mark each unread notification as read on server
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => api.put(`/api/notifications/${n.id}/read`)));
    } catch {
      // ignore
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Dev HireX</span>
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <Link to="/jobs">
              <Button variant="ghost" size="sm">Jobs</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            {user.role !== "admin" && (
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden z-50">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-border/30 last:border-0 transition-colors ${
                            n.read ? "" : "bg-primary/5"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Bell className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                            <div>
                              <p className="text-sm font-medium">{n.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{n.createdAt}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="ml-2 flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-primary text-xs font-medium text-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
              <Badge variant="outline" className="text-[10px] capitalize">{user.role}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/jobs">
              <Button variant="ghost" size="sm">Browse Jobs</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
