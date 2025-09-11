"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import NextImage from "next/image";

interface InterviewFormData {
  type: string;
  role: string;
  techstack: string;
  duration: string;
  profilePicture: File | null;
  profilePictureUrl: string | null;
}

const InterviewForm = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null);
  const [uploadedProfilePicture, setUploadedProfilePicture] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [formData, setFormData] = useState<InterviewFormData>({
    type: "Technical",
    role: "",
    techstack: "",
    duration: "10",
    profilePicture: null,
    profilePictureUrl: null,
  });

  // Fetch user's profile picture from signup
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user-profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUserProfilePicture(userData.profilePictureUrl);
          setFormData(prev => ({
            ...prev,
            profilePictureUrl: userData.profilePictureUrl
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedProfilePicture({ file, url: result.url });
        setFormData(prev => ({
          ...prev,
          profilePictureUrl: result.url
        }));
        toast.success(`Profile picture uploaded successfully! (${file.name})`);
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting interview form:", formData);

      // Upload profile picture if one is selected
      let profilePictureUrl = formData.profilePictureUrl;
      if (formData.profilePicture && !profilePictureUrl) {
        await handleImageUpload(formData.profilePicture);
        profilePictureUrl = formData.profilePictureUrl;
      }

      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.type,
          role: formData.role,
          level: "Mid", // Default level
          techstack: formData.techstack,
          amount: parseInt(formData.duration),
          userid: userId,
          profilePictureUrl: profilePictureUrl,
          duration: parseInt(formData.duration),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Interview generated successfully!");
        router.push(`/interview/voice?interviewId=${result.interviewId}`);
      } else {
        toast.error("Failed to generate interview. Please try again.");
      }
    } catch (error) {
      console.error("Error generating interview:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (field: keyof InterviewFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If it's a profile picture file, upload it immediately
    if (field === "profilePicture" && value instanceof File) {
      await handleImageUpload(value);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo and Brand Name */}
      <div className="flex items-center justify-center mb-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Questly Logo" width={32} height={32} />
          <h2 className="text-primary-100 font-bold text-xl">Questly</h2>
        </Link>
      </div>

      <div className="bg-background rounded-lg p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-white mb-2">Starting Your Interview</h1>
          <p className="text-gray-400">Customize your mock interview to suit your needs.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Interview Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-white">What type of interview would you like to practice?</Label>
            <select
              id="type"
              className="w-full p-3 border border-gray-600 rounded-full bg-gray-700 text-white h-12"
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
            >
              <option value="Technical">Technical</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">What role are you focusing on?</Label>
            <Input
              id="role"
              type="text"
              placeholder="Select your role"
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-full h-12 px-4"
              required
            />
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label htmlFor="techstack" className="text-white">Which tech stack would you like to focus on?</Label>
            <Input
              id="techstack"
              type="text"
              placeholder="Select your preferred tech stack"
              value={formData.techstack}
              onChange={(e) => handleInputChange("techstack", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-full h-12 px-4"
              required
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-white">How long would you like the interview to be?</Label>
            <select
              id="duration"
              className="w-full p-3 border border-gray-600 rounded-full bg-gray-700 text-white h-12"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
            </select>
          </div>

          {/* Profile Picture */}
          <div className="space-y-2">
            <Label className="text-white">Profile picture</Label>
            
            {/* Show user's profile picture from signup if available */}
            {userProfilePicture ? (
              <div className="flex items-center gap-4 p-3 bg-gray-700 border border-gray-600 rounded-full">
                <NextImage
                  src={userProfilePicture}
                  alt="Profile picture"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <span className="text-white text-sm">Using profile picture from signup</span>
              </div>
            ) : (
              /* Show upload option only if no profile picture from signup */
              <>
                {uploadedProfilePicture ? (
                  /* Show uploaded file with preview */
                  <div className="flex items-center gap-4 p-3 bg-gray-700 border border-gray-600 rounded-full">
                    <NextImage
                      src={uploadedProfilePicture.url}
                      alt="Uploaded profile picture"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <span className="text-white text-sm font-medium">{uploadedProfilePicture.file.name}</span>
                      <p className="text-gray-400 text-xs">Profile picture uploaded</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedProfilePicture(null);
                        setFormData(prev => ({ ...prev, profilePicture: null, profilePictureUrl: null }));
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Remove uploaded image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* Show upload button */
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => await handleInputChange("profilePicture", e.target.files?.[0] || null)}
                      className="hidden"
                      id="profile-picture"
                    />
                    <label htmlFor="profile-picture" className="flex items-center gap-2 cursor-pointer w-full justify-center p-3 bg-gray-700 border border-gray-600 rounded-full hover:bg-gray-600 transition-colors h-12">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-white">Upload an image</span>
                    </label>
                  </>
                )}
              </>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-white hover:bg-gray-100 text-black py-3 text-lg font-semibold rounded-full h-12" 
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Start Interview"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default InterviewForm;
