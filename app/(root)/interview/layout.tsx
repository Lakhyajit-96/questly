"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const InterviewLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  
  // Only apply this layout to the interview form page
  if (pathname !== "/interview") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background pattern">
      {children}
    </div>
  );
};

export default InterviewLayout;
