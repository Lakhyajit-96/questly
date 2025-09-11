"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Check if user provided any meaningful responses
    const userResponses = transcript.filter(
      (msg: { role: string; content: string }) => 
        msg.role === 'user' && 
        msg.content.trim().length > 10 && 
        !msg.content.toLowerCase().includes('hello') &&
        !msg.content.toLowerCase().includes('hi') &&
        !msg.content.toLowerCase().includes('thank you')
    );

    // If no meaningful responses, return 0 score
    if (userResponses.length === 0) {
      const feedback = {
        interviewId: interviewId,
        userId: userId,
        totalScore: 0,
        categoryScores: [
          {"name": "Communication Skills", "score": 0, "comment": "No meaningful responses provided. Candidate did not engage with the interview questions."},
          {"name": "Technical Knowledge", "score": 0, "comment": "Unable to assess technical knowledge due to lack of responses."},
          {"name": "Problem Solving", "score": 0, "comment": "No problem-solving examples or responses provided."},
          {"name": "Cultural Fit", "score": 0, "comment": "Cannot evaluate cultural fit without candidate engagement."},
          {"name": "Confidence and Clarity", "score": 0, "comment": "No responses to assess confidence or clarity."}
        ],
        strengths: [],
        areasForImprovement: ["Engagement", "Communication", "Participation"],
        finalAssessment: "This interview does not reflect serious interest or engagement from the candidate. Their responses are dismissive, vague, or outright negative, making it difficult to assess their qualifications, motivation, or suitability for the role.",
        createdAt: new Date().toISOString(),
      };

      let feedbackRef;
      if (feedbackId) {
        feedbackRef = db.collection("feedback").doc(feedbackId);
      } else {
        feedbackRef = db.collection("feedback").doc();
      }

      await feedbackRef.set(feedback);
      return { success: true, feedbackId: feedbackRef.id };
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are Hailey, a Senior Technical Recruiter with 8+ years of experience at top tech companies. You've just completed an interview and need to provide comprehensive, professional feedback based on real hiring standards used by leading tech companies.

        INTERVIEW ANALYSIS CONTEXT:
        - Interview ID: ${interviewId}
        - Analysis Date: ${new Date().toISOString()}
        - This is a real interview assessment requiring professional evaluation

        PROFESSIONAL FEEDBACK STANDARDS:
        As a senior recruiter, provide feedback that would be used in actual hiring decisions. Your assessment should be:
        1. SPECIFIC: Reference exact examples from the candidate's responses
        2. PROFESSIONAL: Use language appropriate for hiring managers and HR
        3. ACTIONABLE: Provide concrete areas for improvement
        4. REALISTIC: Based on actual industry standards and expectations
        5. DETAILED: Thorough analysis of each competency area
        6. UNIQUE: Tailored specifically to this candidate's performance

        Transcript to Analyze:
        ${formattedTranscript}

        ASSESSMENT CRITERIA (Based on Real Hiring Standards):
        You must evaluate exactly these 5 categories with professional, detailed feedback:

        1. "Communication Skills" 
           - Assess clarity, articulation, and professional communication
           - Look for specific examples of how they explained technical concepts
           - Evaluate structure and organization of responses
           - Consider professional presentation and confidence

        2. "Technical Knowledge"
           - Evaluate depth and accuracy of technical understanding
           - Assess knowledge of relevant technologies and frameworks
           - Look for practical application of technical concepts
           - Consider problem-solving approach and methodology

        3. "Problem Solving"
           - Analyze approach to challenges and debugging
           - Evaluate logical thinking and analytical skills
           - Look for systematic problem-solving methodology
           - Consider creativity and innovation in solutions

        4. "Cultural Fit"
           - Assess alignment with company values and team dynamics
           - Evaluate collaboration and teamwork indicators
           - Look for growth mindset and learning attitude
           - Consider professional demeanor and work ethic

        5. "Confidence and Clarity"
           - Evaluate confidence in responses and self-presentation
           - Assess clarity of thought and expression
           - Look for engagement and enthusiasm
           - Consider professional presence and composure

        SCORING GUIDELINES (Real Industry Standards):
        - 90-100: Exceptional - Would hire immediately, exceeds expectations
        - 80-89: Strong - Would recommend for hire, meets all requirements
        - 70-79: Good - Would consider for hire, minor areas for improvement
        - 60-69: Fair - Would consider with reservations, needs development
        - 50-59: Below Average - Would not recommend, significant gaps
        - 0-49: Poor - Would not hire, major concerns

        Provide detailed, professional feedback that hiring managers would use to make real hiring decisions.`,
      system:
        "You are Hailey, a Senior Technical Recruiter providing professional interview feedback. Your assessments are used for real hiring decisions at top tech companies. Provide detailed, specific feedback based on actual industry standards and hiring criteria. Each assessment should be unique and tailored to the candidate's specific performance.",
    });

    console.log("Generated feedback object:", JSON.stringify(object, null, 2));

    // Ensure we have exactly 5 categories by filtering duplicates and limiting to 5
    const uniqueCategories = new Map();
    object.categoryScores.forEach((category: any) => {
      if (!uniqueCategories.has(category.name)) {
        uniqueCategories.set(category.name, category);
      }
    });
    
    const finalCategoryScores = Array.from(uniqueCategories.values()).slice(0, 5);
    console.log("Final category scores (after deduplication):", finalCategoryScores.length);

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: finalCategoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  console.log(`Checking for feedback: interviewId=${interviewId}, userId=${userId}`);

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  console.log(`Feedback query result: ${querySnapshot.docs.length} documents found`);

  if (querySnapshot.empty) {
    console.log(`No feedback found for interview ${interviewId}`);
    return null;
  }

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  try {
    // Check if userId is valid
    if (!userId) {
      console.log("No userId provided, returning empty array");
      return [];
    }

    console.log("Getting latest interviews for userId:", userId);
    
    const interviews = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .limit(limit)
      .get();

    console.log("Found other users' interviews count:", interviews.docs.length);
    
    const result = interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];

    console.log("Returning other users' interviews:", result.length);
    return result;
  } catch (error) {
    console.error("Error getting latest interviews:", error);
    return null;
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    // Check if userId is valid
    if (!userId) {
      console.log("No userId provided, returning empty array");
      return [];
    }

    console.log("Getting interviews for userId:", userId);
    
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    console.log("Found interviews count:", interviews.docs.length);
    
    const result = interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];

    console.log("Returning interviews:", result.length);
    console.log("Interview statuses:", result.map(i => ({ id: i.id, status: i.status, completedAt: i.completedAt })));
    return result;
  } catch (error) {
    console.error("Error getting user interviews:", error);
    return null;
  }
}

export async function updateInterviewAsCompleted(interviewId: string) {
  try {
    console.log("Updating interview as completed:", interviewId);
    await db.collection("interviews").doc(interviewId).update({
      completedAt: new Date().toISOString(),
      status: "completed",
    });
    console.log("Successfully updated interview as completed:", interviewId);
    return { success: true };
  } catch (error) {
    console.error("Error updating interview:", error);
    return { success: false };
  }
}

export async function deleteInterview(interviewId: string, userId: string) {
  try {
    // First verify the interview belongs to the user
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    
    if (!interviewDoc.exists) {
      return { success: false, message: "Interview not found" };
    }
    
    const interviewData = interviewDoc.data();
    if (interviewData?.userId !== userId) {
      return { success: false, message: "You can only delete your own interviews" };
    }
    
    // Delete the interview
    await db.collection("interviews").doc(interviewId).delete();
    
    // Also delete any associated feedback
    const feedbackQuery = await db.collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();
    
    const feedbackDeletionPromises = feedbackQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(feedbackDeletionPromises);
    
    console.log(`Successfully deleted interview: ${interviewId}`);
    return { success: true, message: "Interview deleted successfully" };
  } catch (error) {
    console.error(`Error deleting interview: ${interviewId}`, error);
    return { success: false, message: "Failed to delete interview" };
  }
}