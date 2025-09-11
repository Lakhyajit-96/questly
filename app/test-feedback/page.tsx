"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestFeedbackGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const generateFeedback = async () => {
    setIsLoading(true);
    setResult("");
    
    try {
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: "K4ZvP5DoG7VPv4VQeUjE",
          userId: "cI5YrdjiXOT6wUW8GzcaTOo4US62"
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Feedback Generation</h1>
      
      <Button 
        onClick={generateFeedback} 
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? "Generating..." : "Generate Feedback for Completed Interview"}
      </Button>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-sm">{result}</pre>
        </div>
      )}
      
      <div className="mt-4">
        <a 
          href="/interview/K4ZvP5DoG7VPv4VQeUjE/feedback" 
          className="text-blue-500 underline"
        >
          Go to Feedback Page
        </a>
      </div>
    </div>
  );
}
