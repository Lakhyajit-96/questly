"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import UserProfileDropdown from "./UserProfileDropdown";

interface ConditionalNavbarProps {
  children: ReactNode;
  userName: string;
  userProfilePicture?: string | null;
}

const ConditionalNavbar = ({ children, userName, userProfilePicture }: ConditionalNavbarProps) => {
  const pathname = usePathname();
  const isInterviewFormPage = pathname === "/interview";

  return (
    <div className="root-layout">
      {!isInterviewFormPage && (
        <nav className="flex justify-between items-center overflow-visible relative z-50">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Questly Logo" width={38} height={32} />
            <h2 className="text-primary-100">Questly</h2>
          </Link>
          
          <UserProfileDropdown userName={userName} userProfilePicture={userProfilePicture} />
        </nav>
      )}

      {children}
    </div>
  );
};

export default ConditionalNavbar;
