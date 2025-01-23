"use client";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { EndIcon } from "./ui/icons";

interface Message {
  text: string;
  isUser: boolean;
}

interface ChatBubbleProps {
  message: Message;
}

interface ChatInterfaceProps {
  toggleConversation: () => void;
  messages: Message[];
  setMicrophoneAccess: (access: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  toggleConversation,
  messages,
  setMicrophoneAccess,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [callDuration, setCallDuration] = useState<number>(0);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prevDuration) => prevDuration + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col w-full mt-10 max-h-screen">
      <div className="flex-1 overflow-y-auto px-2 dark:scrollbar-thin dark:scrollbar-thumb-borderBlue dark:scrollbar-track-bgBlue mx-10">
        {messages.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex row justify-between items-center bg-bgBlue mx-12 mb-24">
        <button
          className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue"
          onClick={toggleConversation}
        >
          <EndIcon />
        </button>
        <span className="text-white">{formatTime(callDuration)}</span>
      </div>
    </div>
  );
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const userPicture = "/Avatar.png";
  const botPicture = "/Bot.png";
  const { text, isUser } = message;

  return (
    <div
      className={`flex mb-5 ${isUser ? "justify-end ml-12" : "justify-start mr-12"}`}
    >
      <div className="flex items-center">
        {!isUser && (
          <div className="mr-2">
            <div className="w-10 h-10 relative">
              <Image
                alt="Bot Avatar"
                className="rounded-full"
                layout="fill"
                objectFit="cover"
                src={botPicture}
              />
            </div>
          </div>
        )}
        <div
          className={`bg-gray-300 rounded-xl py-2 px-4 max-w-full ${
            isUser
              ? "dark:bg-otherBlue text-white"
              : "dark:bg-buttonGray text-white"
          }`}
        >
          <p className="p-2">{text}</p>
        </div>
        {isUser && (
          <div className="ml-2">
            <div className="w-10 h-10 relative">
              <Image
                alt="User Avatar"
                className="rounded-full"
                layout="fill"
                objectFit="cover"
                src={userPicture}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
