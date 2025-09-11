import InterviewForm from "@/components/InterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Form-based generation */}
      <InterviewForm userId={user?.id!} />
    </div>
  );
};

export default Page;
