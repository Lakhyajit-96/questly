"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId, deleteInterview } from "@/lib/actions/general.action";

const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  section = "take", // "your" or "take"
  currentUserId,
}: InterviewCardProps) => {
  const [feedback, setFeedback] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (userId && interviewId) {
        try {
          const feedbackData = await getFeedbackByInterviewId({
            interviewId,
            userId,
          });
          setFeedback(feedbackData);
        } catch (error) {
          console.error("Error fetching feedback:", error);
        }
      }
    };
    fetchFeedback();
  }, [interviewId, userId]);

  const handleDelete = async () => {
    if (!currentUserId) {
      toast.error("User not authenticated");
      return;
    }

    if (!confirm("Are you sure you want to delete this interview? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteInterview(interviewId!, currentUserId);
      if (result.success) {
        toast.success("Interview deleted successfully");
        setIsDeleted(true);
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        toast.error(result.message || "Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    } finally {
      setIsDeleting(false);
    }
  };

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const isCompleted = feedback !== null;
  const showDeleteButton = section === "your" && currentUserId === userId;

  if (isDeleted) {
    return null; // Don't render if deleted
  }

  return (
    <div className="card-border w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <Image
            src={getRandomInterviewCover(interviewId)}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          {/* Interview Role */}
          <h3 className="mt-5 capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              (section === "your" 
                ? "Interview completed. Check your performance feedback below."
                : "You haven't taken this interview yet. Take it now to improve your skills.")}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center">
          <DisplayTechIcons techStack={techstack} />

          <div className="flex flex-row gap-2">
            {showDeleteButton && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="group relative bg-dark-200/50 hover:bg-dark-200 border border-light-600/30 hover:border-destructive-100/50 rounded-full p-2.5 transition-all duration-200 hover:shadow-lg hover:shadow-destructive-100/10"
                title="Delete interview"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border border-destructive-100 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-destructive-100 font-medium">Deleting...</span>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Premium trash icon with subtle glow effect */}
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-light-100 group-hover:text-destructive-100 transition-colors duration-200"
                    >
                      <path 
                        d="M3 6H5H21" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M10 11V17" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M14 11V17" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    
                    {/* Subtle hover indicator */}
                    <div className="absolute -inset-1 bg-destructive-100/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                )}
              </button>
            )}
            
            <Button className="btn-primary">
              <Link
                href={
                  feedback
                    ? `/interview/${interviewId}/feedback`
                    : `/interview/${interviewId}`
                }
              >
                {feedback 
                  ? (section === "your" ? "Check Feedback" : "View Feedback")
                  : "View Interview"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
