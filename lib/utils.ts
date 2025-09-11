import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  console.log("getTechLogos called with:", techArray);
  
  // Filter out undefined, null, or empty values
  const validTechArray = techArray.filter(tech => tech && typeof tech === 'string' && tech.trim() !== '');
  
  console.log("Valid tech array after filtering:", validTechArray);
  
  const logoURLs = validTechArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    console.log(`Tech: "${tech}" -> Normalized: "${normalized}"`);
    
    // If normalized is undefined, use fallback immediately
    if (!normalized) {
      return {
        tech,
        url: "/tech.svg",
      };
    }
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = (interviewId?: string) => {
  if (interviewId) {
    // Use interview ID to generate deterministic "random" index
    let hash = 0;
    for (let i = 0; i < interviewId.length; i++) {
      const char = interviewId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % interviewCovers.length;
    return `/covers${interviewCovers[index]}`;
  }
  
  // Fallback to first cover if no ID provided
  return `/covers${interviewCovers[0]}`;
};
