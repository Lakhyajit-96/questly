"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
    profilePicture: type === "sign-up" ? z.any().optional() : z.any().optional(),
    resume: type === "sign-up" ? z.any().optional() : z.any().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      profilePicture: null,
      resume: null,
    },
  });

  // State to track uploaded files and their URLs
  const [uploadedProfilePicture, setUploadedProfilePicture] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [uploadedResume, setUploadedResume] = useState<{
    file: File;
    url: string;
  } | null>(null);

  // Function to handle immediate profile picture upload
  const handleProfilePictureUpload = async (file: File) => {
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
        toast.success(`Profile picture uploaded successfully! (${file.name})`);
      } else {
        toast.error("Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    }
  };

  // Function to handle immediate resume upload
  const handleResumeUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setUploadedResume({ file, url: result.url });
        toast.success(`Resume uploaded successfully! (${file.name})`);
      } else {
        toast.error("Failed to upload resume");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume");
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;
        toast.info("Starting account creation process...");
        // Small delay to ensure toast is visible
        await new Promise(resolve => setTimeout(resolve, 300));

        // Use already uploaded files
        const profilePictureUrl = uploadedProfilePicture?.url || null;
        const resumeUrl = uploadedResume?.url || null;

        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

          const result = await signUp({
            uid: userCredential.user.uid,
            name: name!,
            email,
            password,
            profilePictureUrl,
            resumeUrl,
          });

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success("Account created successfully. Please sign in.");
          
          // Add a small delay to ensure the toast is visible before redirect
          setTimeout(() => {
            router.push("/sign-in");
          }, 1500);
        } catch (error: any) {
          console.error("Firebase auth error:", error);
          if (error.code === 'auth/email-already-in-use') {
            toast.error("This email is already registered. Please use a different email or sign in instead.");
          } else if (error.code === 'auth/weak-password') {
            toast.error("Password is too weak. Please choose a stronger password.");
          } else if (error.code === 'auth/invalid-email') {
            toast.error("Please enter a valid email address.");
          } else {
            toast.error("Failed to create account. Please try again.");
          }
          return;
        }
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">Questly</h2>
        </div>

        <h3>Practice job interviews with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Full name"
                placeholder="Your full name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            {!isSignIn && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Profile picture</label>
                  {uploadedProfilePicture ? (
                    /* Show uploaded file with preview */
                    <div className="flex items-center gap-4 p-3 bg-gray-700 border border-gray-600 rounded-full">
                      <Image
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
                          form.setValue("profilePicture", null);
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
                    <div className="btn-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleProfilePictureUpload(file);
                          }
                        }}
                        className="hidden"
                        id="profile-picture"
                      />
                      <label htmlFor="profile-picture" className="flex items-center gap-2 cursor-pointer w-full justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-white">Upload an image</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Resume</label>
                  {uploadedResume ? (
                    /* Show uploaded file with preview */
                    <div className="flex items-center gap-4 p-3 bg-gray-700 border border-gray-600 rounded-full">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-white text-sm font-medium">{uploadedResume.file.name}</span>
                        <p className="text-gray-400 text-xs">Resume uploaded</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedResume(null);
                          form.setValue("resume", null);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Remove uploaded resume"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    /* Show upload button */
                    <div className="btn-upload">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleResumeUpload(file);
                          }
                        }}
                        className="hidden"
                        id="resume"
                      />
                      <label htmlFor="resume" className="flex items-center gap-2 cursor-pointer w-full justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-white">Upload resume (PDF, DOC, DOCX)</span>
                      </label>
                    </div>
                  )}
                </div>
              </>
            )}

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
