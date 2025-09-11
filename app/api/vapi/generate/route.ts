import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid, profilePictureUrl, duration } = await request.json();
  
  console.log("API called with data:", { type, role, level, techstack, amount, userid, profilePictureUrl, duration });

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate ${amount} professional, real-world interview questions for a ${role} position.

Role: ${role}
Level: ${level}
Tech Stack: ${techstack}
Type: ${type}

IMPORTANT: Create questions that actual companies ask in real interviews. Focus on practical, hands-on scenarios that test real-world skills and problem-solving abilities.

Question Types to Include:
${type === 'Technical' ? `
- Deep technical knowledge questions specific to ${techstack}
- System design and architecture challenges
- Code review and debugging scenarios
- Performance optimization problems
- Real-world implementation challenges
- Technology-specific best practices
` : type === 'Behavioral' ? `
- Leadership and teamwork scenarios
- Conflict resolution and communication
- Project management and prioritization
- Learning and adaptation experiences
- Problem-solving under pressure
- Career growth and development
` : `
- Technical skills assessment for ${techstack}
- Problem-solving and debugging scenarios
- Team collaboration and communication
- Project experience and challenges
- Learning and adaptation abilities
- Real-world implementation experience
`}

Requirements:
- Questions should be specific to ${role} role and ${techstack} tech stack
- Include real-world scenarios and practical challenges
- Test both technical knowledge and problem-solving approach
- Vary difficulty based on ${level} level
- Ask for specific examples and concrete details
- Include follow-up question opportunities

Return ONLY a JSON array of strings. No other text.

Example format: ["Describe a time when you had to optimize a React application for performance. What specific techniques did you use?", "How would you debug a memory leak in a Node.js application?", "Tell me about a challenging project where you had to learn a new technology quickly."]

Generate exactly ${amount} unique, real-world questions for ${role} role with ${techstack} tech stack.`,
    });

    // Parse questions with error handling
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (parseError) {
      console.error("Failed to parse questions JSON:", parseError);
      console.error("Raw questions response:", questions);
      
      // Fallback: create basic questions if JSON parsing fails
      parsedQuestions = [
        `Tell me about your experience with ${role}`,
        `What challenges have you faced in your previous projects?`,
        `How do you approach problem-solving in your work?`,
        `What interests you most about this ${role} position?`,
        `Describe a time when you had to learn a new technology quickly.`
      ].slice(0, amount);
    }

    // Validate questions array
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      console.warn("Invalid questions array, using fallback questions");
      parsedQuestions = [
        `Tell me about your experience with ${role}`,
        `What challenges have you faced in your previous projects?`,
        `How do you approach problem-solving in your work?`,
        `What interests you most about this ${role} position?`,
        `Describe a time when you had to learn a new technology quickly.`
      ].slice(0, amount);
    }

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      profilePictureUrl: profilePictureUrl || null,
      duration: duration || 10, // Default to 10 minutes if not provided
      createdAt: new Date().toISOString(),
    };

    const interviewRef = await db.collection("interviews").add(interview);
    
    console.log("Interview created successfully:", interview);

    return Response.json({ success: true, interviewId: interviewRef.id }, { status: 200 });
  } catch (error) {
    console.error("Error generating interview:", error);
    
    // Provide more specific error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    
    return Response.json({ 
      success: false, 
      error: errorMessage,
      details: "Failed to generate interview questions. Please try again."
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
