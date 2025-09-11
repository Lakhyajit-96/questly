"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn, getTechLogos } from "@/lib/utils";

interface TechIconProps {
  techStack: string[];
}

interface TechIcon {
  tech: string;
  url: string;
}

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  const [techIcons, setTechIcons] = useState<TechIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTechIcons = async () => {
      try {
        const icons = await getTechLogos(techStack);
        setTechIcons(icons);
      } catch (error) {
        console.error("Error fetching tech icons:", error);
        // Fallback to simple tech names
        setTechIcons(techStack.map(tech => ({ tech, url: "/tech.svg" })));
      } finally {
        setIsLoading(false);
      }
    };

    if (techStack && techStack.length > 0) {
      fetchTechIcons();
    } else {
      setIsLoading(false);
    }
  }, [techStack]);

  if (isLoading) {
    return (
      <div className="flex flex-row gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative group bg-dark-300 rounded-full p-2 flex flex-center animate-pulse"
          >
            <div className="w-5 h-5 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{tech}</span>

          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
