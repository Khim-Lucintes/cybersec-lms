"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  Search,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function StudentMessages() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let user = session?.user;

      if (!user && typeof window !== "undefined") {
        const stored = localStorage.getItem("student_profile");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            user = {
              id: parsed.studentId || "11111111-1111-1111-1111-111111111111",
              email: parsed.email || "student@urios.edu.ph",
              user_metadata: { full_name: parsed.name || "Student" }
            };
          } catch (e) {}
        }
      }

      if (!user) {
        router.push("/");
        return;
      }
      setCurrentUser(user);

      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id},receiver_id.eq.BROADCAST`)
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          setMessages(data);
          // Mark all as read upon entering the messages page
          const unreadIds = data.filter(m => !m.is_read && m.sender_id !== user.id).map(m => m.id);
          if (unreadIds.length > 0) {
            await supabase.from('direct_messages').update({ is_read: true }).in('id', unreadIds);
          }
        }
      } catch (e) {
        const stored = localStorage.getItem(`all_msgs`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const myMsgs = parsed.filter(m => m.sender_id === user.id || m.receiver_id === user.id || m.receiver_id === 'BROADCAST');
          
          // Mark read locally
          const updated = parsed.map(m => (m.receiver_id === user.id ? { ...m, is_read: true } : m));
          localStorage.setItem(`all_msgs`, JSON.stringify(updated));
          setMessages(updated.filter(m => m.sender_id === user.id || m.receiver_id === user.id || m.receiver_id === 'BROADCAST'));
        }
      }
    };
    fetchUserAndMessages();
  }, [router]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    setIsSendingMessage(true);
    
    const adminId = "22222222-2222-2222-2222-222222222222"; // Hardcoded instructor
    
    try {
      const newMsg = {
        sender_id: currentUser.id,
        receiver_id: adminId,
        content: newMessage,
      };

      const { error } = await supabase.from('direct_messages').insert([newMsg]);
      
      if (error) {
        // Fallback
        const allMsgs = JSON.parse(localStorage.getItem(`all_msgs`) || '[]');
        const updatedMsgs = [...allMsgs, { ...newMsg, created_at: new Date().toISOString(), is_read: false }];
        localStorage.setItem(`all_msgs`, JSON.stringify(updatedMsgs));
        setMessages(updatedMsgs.filter(m => m.sender_id === currentUser.id || m.receiver_id === currentUser.id || m.receiver_id === 'BROADCAST'));
      } else {
        // Refetch
        const { data } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id},receiver_id.eq.BROADCAST`)
          .order('created_at', { ascending: true });
        if (data) setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingMessage(false);
      setNewMessage("");
    }
  };

  const filteredMessages = messages.filter(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#002D62] text-white py-4 px-6 shadow-md flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-serif tracking-wide">Messages</h1>
            <p className="text-xs text-[#C5A059] opacity-90 tracking-wider uppercase font-semibold">
              Communication Center
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col h-[calc(100vh-80px)]">
        <div className="bg-white rounded-2xl shadow-sm border border-[#EAEAEA] flex flex-col flex-1 overflow-hidden">
          
          {/* Messages Header */}
          <div className="p-4 border-b border-[#EAEAEA] bg-[#FCFCFC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#002D62]/10 rounded-full flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-[#002D62]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Mr. Orlando Ritchie R. Natonton</h2>
                <p className="text-xs text-[#666]">Faculty Instructor</p>
              </div>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888]" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAEAEA] rounded-full text-xs focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#888] space-y-3">
                <MessageSquare className="h-12 w-12 text-[#DDD]" />
                <p className="text-sm">No messages found.</p>
              </div>
            ) : (
              filteredMessages.map((msg, i) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div key={i} className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                    <div 
                      className={`px-4 py-3 rounded-2xl text-sm max-w-[70%] shadow-sm ${
                        isMe 
                          ? "bg-[#002D62] text-white rounded-br-sm" 
                          : "bg-white border border-[#EAEAEA] text-[#333] rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-[10px] text-[#999] flex items-center gap-1">
                      {isMe ? "You" : "Instructor"} • {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Compose Area */}
          <div className="p-4 bg-white border-t border-[#EAEAEA]">
            <div className="flex gap-3 items-end">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message to your instructor..."
                rows={2}
                className="flex-1 p-3 bg-[#F8F9FA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-[#002D62] focus:ring-1 focus:ring-[#002D62] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isSendingMessage || !newMessage.trim()}
                className="bg-[#C5A059] hover:bg-[#A38243] text-white h-[52px] w-[52px] rounded-xl shadow-sm shrink-0"
              >
                {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-[10px] text-[#999] mt-2 text-right">Press Enter to send, Shift + Enter for new line</p>
          </div>
        </div>
      </main>
    </div>
  );
}
