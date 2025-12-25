"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FloatingChatButton from "@/components/FloatingChatButton";
import ChatModal from "@/components/ChatModal";

interface ChatContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Define auth pages where chat button should be hidden
  const authPages = ["/login", "/register", "/logout"];
  const isAuthPage = authPages.includes(pathname);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat }}>
      {children}
      {/* Only show the floating chat button if not on auth pages - regardless of auth status */}
      {!isAuthPage && <FloatingChatButton onClick={openChat} />}
      <ChatModal isOpen={isChatOpen} onClose={closeChat} />
    </ChatContext.Provider>
  );
};