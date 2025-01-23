"use client";
import { useCallsCreateCall } from "@/api/calls/calls";
import { useLeadsGetLead } from "@/api/leads/leads";
import { usePromptsGetPrompts } from "@/api/prompts/prompts";
import { CallType, Prompt, RegisterCallResponse } from "@/api/schemas";
import ChatInterface from "@/components/ChatInterface";
import SuspectSidebar from "@/components/SuspectSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { returnType } from "../funnel/suspect/[id]/page";

interface PracticeProps {}

interface Message {
  text: string;
  isUser: boolean;
}

declare global {
  interface Window {
    CogniCue: any;
  }
}

const cleanLocalStorage = () => {
  const accessToken = localStorage.getItem("accessToken");
  const branchID = localStorage.getItem("branchID");
  localStorage.clear();
  if (accessToken && branchID) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("branchID", branchID);
  }
};

const webClient = new RetellWebClient();
const Practice: React.FC<PracticeProps> = () => {
  const { toast } = useToast();
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean | null>(
    true
  );
  const [cameraAccess, setCameraAccess] = useState<boolean | null>(true);
  const [leadName, setLeadName] = useState("");
  const [callStarted, setCallStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "", isUser: false },
  ]);
  const [leadId, setLeadId] = useState("");
  const [lastTranscriptObjectID, setLastTranscriptObjectID] = useState(0);
  const [selectedType, setSelectedType] =
    useState<CallType>("appointment_call");
  const [callStartedLoading, setCallStartedLoading] = useState(false);
  const cgcRef = useRef<any>(null);
  const videoFeedRef = useRef<HTMLVideoElement | null>(null);

  let branchID = "";
  if (typeof window !== "undefined") {
    branchID = localStorage.getItem("branchID") ?? "";
  }
  const { data } = useLeadsGetLead(leadId as string);
  const leadDetails = data as returnType;

  const { mutateAsync: createCall } =
    useCallsCreateCall<RegisterCallResponse>();

  const toggleConversation = async () => {
    if (callStarted) {
      webClient.stopConversation();
      if (cgcRef.current) {
        cgcRef.current
          .stop()
          .then(() => {
            console.debug("cgc stopped");
          })
          .catch((error: any) => {
            console.error("cgc stop:", error);
          })
          .finally(() => {
            cgcRef.current.destroy();
            cgcRef.current = null;
            console.debug("cgc destroyed");
            setMessages([{ text: "", isUser: false }]);
            setTimeout(() => {
              window.location.href = "/history";
            }, 3000);
          });
      }
    } else {
      if (
        !leadDetails.lead ||
        !leadDetails.lead.associated_agent ||
        !leadDetails.lead.known_to_agent
      ) {
        toast({
          title: "Error",
          description:
            "Selected lead is missing required fields: Agent Associated or Known to Agent.",
        });
        return;
      }

      setCallStartedLoading(true);

      cleanLocalStorage();

      const registerCallResponse = await createCall({
        data: {
          lead_id: leadId,
          prompt_id: selectedPrompt?.id ?? "",
          call_type: selectedType,
        },
      });

      if (registerCallResponse) {
        try {
          const internal_id = (registerCallResponse?.metadata as any).call_id;

          await webClient.startConversation({
            callId: registerCallResponse?.call_id,
            sampleRate: registerCallResponse.sample_rate,
            enableUpdate: true,
          });

          if (typeof window !== "undefined" && window.CogniCue) {
            cgcRef.current = new window.CogniCue({
              accountID: process.env.NEXT_PUBLIC_COGNICUE_ACCOUNT_ID,
              interviewID: process.env.NEXT_PUBLIC_COGNICUE_INTERVIEW_ID,
              candidate: {
                email: `${internal_id}@refreshmint.in`,
              },
            });

            console.debug("cognicue sdk initialized", {
              accountID: process.env.NEXT_PUBLIC_COGNICUE_ACCOUNT_ID,
              interviewID: process.env.NEXT_PUBLIC_COGNICUE_INTERVIEW_ID,
              candidate: {
                email: `${internal_id}@refreshmint.in`,
              },
              cgc: cgcRef.current,
            });

            cgcRef.current.ready();

            cgcRef.current
              .start()
              .then((question: any) => {
                console.debug("cgc: received question", {
                  cgcRef: cgcRef.current,
                });
              })
              .catch((error: any) => {
                console.error("cgc start:", error);
              });
          } else {
            console.error("CogniCue SDK is not available");
          }

          setCallStarted(true);
        } catch (error) {
          console.error(error);
          toast({
            title: "Call could not be initiated.",
            description: error as string,
          });
        }
      }

      setCallStartedLoading(false);
    }
  };

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const handleViewPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleSelectLead = ({ name, id }: { name: string; id: string }) => {
    setLeadName(name);
    setLeadId(id);
  };

  const handleTranscriptUpdate = useCallback(
    (update: any) => {
      // Ignore turntaking updates
      if (update?.turntaking) {
        return;
      }
      const transcript = update?.transcript || [];
      let currentTranscriptObject = transcript[lastTranscriptObjectID];

      // Check if a new object is available
      if (lastTranscriptObjectID + 1 < transcript.length) {
        // Update last transcript object ID
        const newTranscriptObjectID = lastTranscriptObjectID + 1;
        setLastTranscriptObjectID(newTranscriptObjectID);
        currentTranscriptObject = transcript[newTranscriptObjectID];

        // Construct a new message from the current object
        const newMessage: Message = {
          text: currentTranscriptObject?.content,
          isUser: currentTranscriptObject.role === "user",
        };

        setMessages((prevMessages) => {
          const newMessages = prevMessages.slice();
          newMessages.push(newMessage);
          return newMessages;
        });
      } else {
        // Otherwise, keep constructing the last message
        setMessages((prevMessages) => {
          const newMessages = prevMessages.slice();
          const updatedMessage = newMessages[lastTranscriptObjectID];
          updatedMessage.text = currentTranscriptObject?.content;
          return newMessages;
        });
      }
    },
    [lastTranscriptObjectID, messages]
  );

  const handleConversationStarted = useCallback(() => {
    console.log("conversationStarted");
  }, []);

  const handleConversationEnded = useCallback(({ code, reason }: any) => {
    console.log("Closed with code:", code, ", reason:", reason);
    setCallStarted(false);
    setMessages([{ text: "", isUser: false }]);
    setLastTranscriptObjectID(0);
  }, []);

  const handleError = useCallback((error: any) => {
    toast({
      title: "Call could not be initiated.",
    });
    console.error("An error occurred:", error);
    setCallStarted(false);
    setCallStartedLoading(false);
  }, []);

  useEffect(() => {
    // Check if microphone and camera access are already granted
    (async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMicrophoneAccess(true);
        setCameraAccess(true);
        mediaDevices.getTracks().forEach((track) => {
          console.log("Device: ", track);
          if (track.kind === "video") {
            if (videoFeedRef.current) {
              videoFeedRef.current.srcObject = mediaDevices;
            }
          }
        });
      } catch (error) {
        setMicrophoneAccess(false);
        setCameraAccess(false);
      }
    })();
  }, []);

  useEffect(() => {
    webClient.on("conversationStarted", handleConversationStarted);
    webClient.on("conversationEnded", handleConversationEnded);
    webClient.on("error", handleError);
    webClient.on("update", handleTranscriptUpdate);

    return () => {
      webClient.off("conversationStarted", handleConversationStarted);
      webClient.off("conversationEnded", handleConversationEnded);
      webClient.off("error", handleError);
      webClient.off("update", handleTranscriptUpdate);
    };
  }, [
    handleConversationStarted,
    handleConversationEnded,
    handleError,
    handleTranscriptUpdate,
  ]);

  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const { data: prompts, refetch: refetchPrompts } = usePromptsGetPrompts<
    Prompt[]
  >({
    branch_id: branchID,
  });

  useEffect(() => {
    if (prompts) {
      setAllPrompts(
        prompts.filter((prompt) => prompt.prompt_type === "conversation")
      );
    }
  }, [prompts]);

  return (
    <main className="dark dark:bg-bgBlue">
      <div className="grid grid-cols-[1fr_300px] min-h-screen max-w-screen">
        <div className="col-start-1">
          {!callStarted && (
            <>
              <div className="flex flex-1 flex-col items-center justify-center mt-20 h-60">
                <span className="dark:text-white mt-48 mb-10">
                  Select a prompt and lead to start the call
                </span>
                <Card className="w-10/12 pt-4 mx-48">
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allPrompts?.map((prompt) => (
                        <Card
                          key={prompt.id}
                          className={`cursor-pointer ${
                            selectedPrompt?.id === prompt.id
                              ? "dark:border-gray-300"
                              : ""
                          }`}
                          onClick={() => handleViewPrompt(prompt)}
                        >
                          <CardContent className="flex flex-col p-6 gap-2 h-48 overflow-auto">
                            <div className="text-md font-semibold text-white">
                              {prompt?.name}
                            </div>
                            <div className="text-sm text-white">
                              {prompt?.description}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {leadName && (
                <div className="flex flex-col gap-3 items-center justify-center rounded-lg py-2 mx-36 mt-36 ">
                  <Button
                    variant="default"
                    className="text-white text-base dark:text-white h-10 dark:bg-buttonBlue hover:bg-slate-800 px-14 mt-4"
                    onClick={toggleConversation}
                    disabled={callStartedLoading}
                  >
                    START CALL
                  </Button>
                </div>
              )}
            </>
          )}
          {callStarted && (
            <ChatInterface
              toggleConversation={toggleConversation}
              messages={messages}
              setMicrophoneAccess={setMicrophoneAccess}
            />
          )}
          <div className="w-full max-w-xs absolute bottom-5 right-5">
            <video
              ref={videoFeedRef}
              autoPlay
              playsInline
              className="w-full h-auto rounded-lg shadow-xl"
              muted
            />
          </div>
        </div>
        <div className="col-start-2">
          <SuspectSidebar onSelectLead={handleSelectLead} />
        </div>
      </div>
    </main>
  );
};

export default Practice;
