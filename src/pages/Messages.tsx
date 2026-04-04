import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Message } from "@/lib/types";

interface Contact {
  id: string;
  name: string;
  company: string;
  online: boolean;
  lastMsg: string;
  unread: number;
}

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        const res = await api.get("/api/messages/contacts");
        setContacts(res.data);
        if (res.data.length > 0) {
          setSelected(res.data[0]);
        }
      } catch {
        setContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, []);

  // Fetch messages when selected contact changes
  useEffect(() => {
    if (!selected) return;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/api/messages/${selected.id}`);
        setMessages(res.data);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selected?.id]);

  // Listen for real-time messages
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selected) return;
    try {
      const res = await api.post("/api/messages", {
        receiverId: selected.id,
        text: newMsg,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
    } catch {
      // Silently fail
    }
  };

  if (!selected && !loadingContacts) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <Card className="flex h-[calc(100vh-14rem)] items-center justify-center border-border/50">
          <p className="text-muted-foreground">No conversations yet</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <Card className="flex h-[calc(100vh-14rem)] overflow-hidden border-border/50">
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 h-8 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${selected?.id === c.id ? "bg-secondary" : "hover:bg-secondary/50"}`}
                >
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {c.name.charAt(0)}
                    </div>
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      {c.unread > 0 && <Badge className="h-4 w-4 p-0 flex items-center justify-center text-[10px] gradient-primary border-0 text-primary-foreground">{c.unread}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {selected && (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {selected.name.charAt(0)}
                  </div>
                  {selected.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.online ? "Online" : "Offline"} · {selected.company}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        msg.senderId === user?.id
                          ? "gradient-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary rounded-bl-md"
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.senderId === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-3 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} className="gradient-primary border-0 text-primary-foreground shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
