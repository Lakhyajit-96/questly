import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not authenticated" 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      profilePictureUrl: user.profilePictureUrl || null,
      resumeUrl: user.resumeUrl || null,
      name: user.name,
      email: user.email
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch user profile" 
    }, { status: 500 });
  }
}
