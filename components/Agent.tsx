"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer, createInterviewer, getRandomFemaleAgentName, getRandomGreeting } from "@/constants";
import { createFeedback, updateInterviewAsCompleted } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  profilePictureUrl,
  duration,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [durationTimer, setDurationTimer] = useState<NodeJS.Timeout | null>(null);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);


  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      
      // Start duration timer if duration is provided
      if (duration && duration > 0) {
        setTimeRemaining(duration * 60); // Convert minutes to seconds
        
        const timer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Time's up - end the call
              clearInterval(timer);
              setDurationTimer(null); // Reset timer state
              vapi.stop();
              setCallStatus(CallStatus.FINISHED);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setDurationTimer(timer);
      }
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      
      // Clear duration timer
      if (durationTimer) {
        clearInterval(durationTimer);
        setDurationTimer(null);
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: any) => {
      // Handle empty or undefined errors gracefully
      if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
        console.warn("Empty Vapi error received - this is normal during call transitions");
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn("Vapi Error:", errorMessage);
      
      // Don't change call status for normal meeting end events
      if (errorMessage?.includes('Meeting has ended') || 
          errorMessage?.includes('ejection') || 
          errorMessage?.includes('Meeting ended')) {
        console.warn("Meeting ended normally - no action needed");
        return;
      }
      
      if (errorMessage?.includes('Clipboard') || errorMessage?.includes('writeText')) {
        console.warn("Clipboard access denied - this is normal and doesn't affect functionality");
        return;
      }
      
      // Only set status to inactive for unexpected errors
      setCallStatus(CallStatus.INACTIVE);
      
      // Show user-friendly error message only for unexpected errors
      if (errorMessage && errorMessage !== '{}' && errorMessage !== '') {
        alert(`Voice interview error: ${errorMessage}. Please try again.`);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      
      // Cleanup duration timer
      if (durationTimer) {
        clearInterval(durationTimer);
      }
    };
  }, [duration]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      // Check if we have the required data
      if (!interviewId) {
        console.error("No interview ID provided - cannot save feedback");
        router.push("/");
        return;
      }

      if (!userId) {
        console.error("No user ID provided - cannot save feedback");
        router.push("/");
        return;
      }

      // First, mark the interview as completed
      console.log("Marking interview as completed:", interviewId);
      await updateInterviewAsCompleted(interviewId);

      console.log("Creating feedback for interview:", interviewId);
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId,
        userId: userId,
        transcript: messages,
        feedbackId,
      });

      console.log("Feedback creation result:", { success, id });

      if (success && id) {
        console.log("Feedback created successfully, redirecting to feedback page");
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.error("Error saving feedback - success:", success, "id:", id);
        router.push("/");
      }
    };

    console.log("Agent useEffect - callStatus:", callStatus, "type:", type, "messages.length:", messages.length, "isRepeating:", isRepeating);
    
    if (callStatus === CallStatus.FINISHED && !isRepeating) {
      console.log("Call finished naturally, type:", type);
      if (type === "generate") {
        console.log("Type is generate, redirecting to home");
        router.push("/");
      } else {
        console.log("Type is interview, calling handleGenerateFeedback");
        handleGenerateFeedback(messages);
      }
    } else if (callStatus === CallStatus.FINISHED && isRepeating) {
      console.log("Call finished during repeat - not generating feedback");
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId, isRepeating]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      console.log("Starting Vapi call...");
      console.log("Environment check:", {
        hasVapiToken: !!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN,
        hasWorkflowId: !!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
        type: type,
        userName: userName,
        userId: userId
      });

      if (type === "generate") {
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        if (!workflowId) {
          throw new Error("Vapi workflow ID not configured in production");
        }
        
        console.log("Starting workflow call with ID:", workflowId);
        await vapi.start(workflowId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        // Create random interviewer with random name and greeting
        console.log("Creating interviewer for interviewId:", interviewId);
        const randomAgentName = getRandomFemaleAgentName(interviewId);
        const randomGreeting = getRandomGreeting(interviewId);
        const randomInterviewer = createInterviewer(randomAgentName, randomGreeting);

        console.log("Starting interviewer call with questions:", formattedQuestions);
        console.log("Using agent:", randomAgentName, "with greeting:", randomGreeting);
        console.log("Full firstMessage:", randomInterviewer.firstMessage);
        
        await vapi.start(randomInterviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.warn("Failed to start Vapi call:", error);
      setCallStatus(CallStatus.INACTIVE);
      
      // Handle specific error types more gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage?.includes('Clipboard') || errorMessage?.includes('writeText')) {
        console.warn("Clipboard access denied - this is normal and doesn't affect functionality");
        return; // Don't show alert for clipboard errors
      }
      
      if (errorMessage?.includes('workflow') || errorMessage?.includes('not configured')) {
        alert(`Voice interview setup error: ${errorMessage}. Please use the form above instead.`);
        return;
      }
      
      // Show user-friendly error message for other errors
      if (errorMessage && errorMessage !== '{}' && errorMessage !== '') {
        alert(`Failed to start voice interview: ${errorMessage}. Please check your microphone permissions and try again.`);
      }
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const handleRepeat = async () => {
    try {
      // Set repeating flag to prevent feedback generation
      setIsRepeating(true);
      
      // Stop the current call first
      vapi.stop();
      
      // Reset all states
      setMessages([]);
      setLastMessage("");
      setCallStatus(CallStatus.INACTIVE);
      
      // Reset timer to original duration
      if (duration) {
        setTimeRemaining(duration * 60);
      }
      
      // Clear any existing timer
      if (durationTimer) {
        clearInterval(durationTimer);
        setDurationTimer(null);
      }
      
      // Wait a moment for cleanup, then restart
      setTimeout(async () => {
        await handleCall();
        // Clear repeating flag after successful restart
        setIsRepeating(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error during repeat:", error);
      // Fallback: just reset states and try to restart
      setMessages([]);
      setLastMessage("");
      setCallStatus(CallStatus.INACTIVE);
      if (duration) {
        setTimeRemaining(duration * 60);
      }
      
      setTimeout(async () => {
        await handleCall();
        setIsRepeating(false);
      }, 1000);
    }
  };

  const handleLeaveInterview = () => {
    // End the call and redirect to home
    vapi.stop();
    setCallStatus(CallStatus.FINISHED);
    router.push("/");
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src={profilePictureUrl || "/user-avatar.png"}
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Timer Display */}
      {callStatus === CallStatus.ACTIVE && duration && timeRemaining > 0 && (
        <div className="w-full flex justify-center mb-6">
          <div className="bg-gray-800 border border-gray-600 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">Interview Time</span>
                <span className="text-white text-xl font-bold">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <div className="flex justify-between items-center w-full max-w-md">
            <Button 
              variant="outline" 
              className="bg-dark-200 text-white border-gray-600 hover:bg-dark-300"
              onClick={handleRepeat}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Repeat
            </Button>
            
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleLeaveInterview}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Leave interview
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Agent;
