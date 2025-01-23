import { useCallsGetCall } from "@/api/calls/calls";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { Button } from "./ui/button";
import { BackIcon } from "./ui/icons";

interface Message {
  sender: string;
  message: string;
}

interface ChatInterfaceProps {
  id: string;
  onBackButtonClick: () => void;
}

const ChatSummary: React.FC<ChatInterfaceProps> = ({
  id,
  onBackButtonClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    data: callDetails,
    isLoading,
    isError,
  } = useCallsGetCall(id as string);

  let messages: Message[] = [];

  if (
    callDetails &&
    typeof callDetails === "object" &&
    "transcript" in callDetails &&
    typeof callDetails.transcript === "string"
  ) {
    // Split the transcript into individual messages
    const messageLines = callDetails.transcript.split("\n");

    // Construct message objects from the message lines
    messages = messageLines.map((line) => {
      const [sender, message] = line.split(": ");
      return { sender, message };
    });
  }

  return (
    <div className="flex flex-col w-full flex-1 mt-10 mx-24">
      <div className="flex-1 overflow-y-auto px-2 dark:scrollbar-thin dark:scrollbar-thumb-borderBlue dark:scrollbar-track-bgBlue ">
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p>Error fetching data</p>
        ) : Array.isArray(messages) ? (
          <>
            {messages.map((message, index) => (
              <ChatBubble key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <p className="text-white">Transcript is not ready yet</p>
        )}
      </div>
      <div className="flex row justify-between items-center bg-bgBlue mb-20">
        <button
          className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle ml-2 mt-1"
          onClick={onBackButtonClick}
        >
          <BackIcon />
        </button>
        <div className="flex gap-2 mr-3">
          <Button
            variant="default"
            className="text-white text-base dark:text-white md:w-43 lg:w-43 h-9 dark:bg-otherBlue border dark:border-borderBlue hover:bg-slate-800 px-10 py-5"
            onClick={() => router.push(`/history/report/${id}`)}
          >
            VIEW CALL REPORT
          </Button>
          <Button
            variant="default"
            className="text-white text-base dark:text-white md:w-43 lg:w-43 h-9 dark:bg-buttonBlue hover:bg-slate-800 px-10 py-5"
            onClick={() => router.push(`/practice`)}
          >
            START NEW CALL
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const userPicture = "/Avatar.png";
  const botPicture = "/Bot.png";

  const { sender, message: text } = message;
  const isUser = sender === "User";

  return (
    <div
      className={`flex mb-5 ${
        isUser ? "justify-end ml-12" : "justify-start mr-12"
      }`}
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

export default ChatSummary;
