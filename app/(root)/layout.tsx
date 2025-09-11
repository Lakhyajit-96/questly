import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();

  return (
    <ConditionalNavbar userName={user?.name || ""} userProfilePicture={user?.profilePictureUrl || null}>
      {children}
    </ConditionalNavbar>
  );
};

export default Layout;
