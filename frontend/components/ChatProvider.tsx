"use client";

import { useState, createContext, useContext, ReactNode } from "react";
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

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat }}>
      {children}
      <FloatingChatButton onClick={openChat} />
      <ChatModal isOpen={isChatOpen} onClose={closeChat} />
    </ChatContext.Provider>
  );
};