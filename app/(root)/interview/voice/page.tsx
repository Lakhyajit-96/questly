import Image from "next/image";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/general.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

interface VoiceInterviewPageProps {
  searchParams: Promise<{ interviewId?: string }>;
}

const VoiceInterviewPage = async ({ searchParams }: VoiceInterviewPageProps) => {
  const user = await getCurrentUser();
  const params = await searchParams;
  const interviewId = params.interviewId;

  // Fetch the actual interview data
  const interview = interviewId ? await getInterviewById(interviewId) : null;

  return (
    <>
      {/* Interview Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">H</span>
            </div>
            <h3 className="text-white text-lg font-bold">
              {interview ? `${interview.role} Interview` : 'Technical Interview'}
            </h3>
            {interview ? (
              <DisplayTechIcons techStack={interview.techstack} />
            ) : (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-blue-400 text-xs font-bold">⚛</span>
                </div>
                <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-blue-400 text-xs font-bold">S</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="bg-gray-700 px-3 py-1 rounded-full">
            <span className="text-white text-sm">
              {interview ? interview.type : 'Technical Interview'}
            </span>
          </div>
        </div>
      </div>

      <Agent
        userName={user?.name!}
        userId={user?.id}
        interviewId={interviewId}
        type="interview"
        questions={interview?.questions}
        profilePictureUrl={interview?.profilePictureUrl}
        duration={interview?.duration}
      />
    </>
  );
};

export default VoiceInterviewPage;
