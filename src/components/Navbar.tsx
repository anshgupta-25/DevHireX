import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, LogOut, LayoutDashboard, User as UserIcon, ChevronDown } from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { getUploadUrl } from "@/lib/uploads";
import type { Notification } from "@/lib/types";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch notifications and unread messages count
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        const [notifRes, msgRes] = await Promise.all([
          api.get("/api/notifications"),
          api.get("/api/messages/unread-count").catch(() => ({ data: { unreadCount: 0 } }))
        ]);
        setNotifications(notifRes.data);
        setUnreadMessages(msgRes.data.unreadCount || 0);
      } catch {
        // ignore
      }
    };
    fetchData();
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
    const handleNewMessage = () => {
      if (!window.location.pathname.includes('/messages')) {
        setUnreadMessages((prev) => prev + 1);
      }
    };
    socket.on("notification", handleNotif);
    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("notification", handleNotif);
      socket.off("newMessage", handleNewMessage);
    };
  }, [isAuthenticated, user?.id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md">
            <LogoIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
            DevHire<span className="text-[#6366f1]">X</span>
          </span>
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
              <Link to="/messages" onClick={() => setUnreadMessages(0)}>
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-4 w-4" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
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
                          className={`px-4 py-3 border-b border-border/30 last:border-0 transition-colors ${n.read ? "" : "bg-primary/5"
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

            {/* Profile Avatar Dropdown */}
            <div className="relative ml-2" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full bg-secondary/70 p-1 pr-2.5 hover:bg-secondary transition-all cursor-pointer border border-border/30"
              >
                {user.avatar ? (
                  <img
                    src={getUploadUrl(user.avatar)}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground stroke-[3] ml-0.5" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-border/30 bg-secondary/30">
                    <p className="text-sm font-semibold flex items-center justify-between mb-0.5">
                      <span className="truncate">{user.name}</span>
                      <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize border shrink-0 ${
                        user.role === 'student' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        user.role === 'recruiter' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-purple-100 text-purple-700 border-purple-200'
                      }`}>
                        {user.role}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate("/profile"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors text-left"
                    >
                      <UserIcon className="h-4 w-4 text-muted-foreground" /> My Profile
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate("/dashboard"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors text-left"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Dashboard
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border/30 py-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); logout(); navigate("/"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-medium text-gray-500">
              <Link to="/jobs" className="hover:text-gray-900 transition-colors">Jobs</Link>
              <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
              <a href="#process" className="hover:text-gray-900 transition-colors">How it Works</a>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              <Link to="/signup">
                <Button className="bg-[#6366f1] hover:bg-indigo-600 border-0 rounded-xl px-6 h-10 shadow-md text-white font-semibold">
                  Sign Up
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
