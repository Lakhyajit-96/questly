import { NextRequest, NextResponse } from "next/server";
import { createFeedback } from "@/lib/actions/general.action";

export async function POST(request: NextRequest) {
  try {
    const { interviewId, userId } = await request.json();
    
    console.log("Manual feedback generation for:", { interviewId, userId });
    
    // Create a mock transcript for testing
    const mockTranscript = [
      { role: "assistant", content: "Hello! Welcome to your mock interview. Let's start with the first question." },
      { role: "user", content: "Thank you, I'm ready to begin." },
      { role: "assistant", content: "Great! Can you tell me about your experience with React?" },
      { role: "user", content: "I have been working with React for about 2 years. I've built several applications using hooks, context API, and have experience with state management." },
      { role: "assistant", content: "Excellent! Now, can you explain the difference between useState and useEffect?" },
      { role: "user", content: "useState is used for managing component state, while useEffect is used for side effects like API calls, subscriptions, or cleanup." },
      { role: "assistant", content: "Perfect! That concludes our interview. Thank you for your time." },
      { role: "user", content: "Thank you for the opportunity!" }
    ];
    
    const result = await createFeedback({
      interviewId,
      userId,
      transcript: mockTranscript,
    });
    
    console.log("Manual feedback generation result:", result);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Feedback generated successfully",
        feedbackId: result.feedbackId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to generate feedback" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in manual feedback generation:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}
