import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

// Function to get time-appropriate greeting
export const getTimeBasedGreeting = (): string => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening";
  } else {
    return "Good evening"; // Late night/early morning
  }
};

// Random greeting messages for interviews
export const getRandomGreeting = (interviewId?: string): string => {
  console.log("getRandomGreeting called with interviewId:", interviewId);
  
  const greetings = [
    "Hello! Thank you for taking the time to speak with me today.",
    "Hi there! I'm excited to learn more about your background and experience.",
    "Good to meet you! I'm looking forward to our conversation today.",
    "Welcome! Thank you for joining me for this interview session.",
    "Hello! It's great to have you here for our discussion today.",
    "Hi! I'm thrilled to get to know you better through this interview.",
    "Good to see you! Let's dive into learning about your professional journey.",
    "Hello! I'm excited to explore your skills and experience with you today.",
    "Hi there! Thank you for making time for this important conversation.",
    "Welcome! I'm looking forward to understanding your background better.",
    "Hello! It's wonderful to have this opportunity to speak with you.",
    "Hi! Let's start by getting to know each other and your professional story.",
    "Good to meet you! I'm eager to learn about your expertise and experience.",
    "Hello! Thank you for being here - let's make this a great conversation.",
    "Hi there! I'm excited to hear about your journey and accomplishments."
  ];
  
  // Use interviewId or timestamp to ensure different greetings each time
  let seed = Date.now();
  if (interviewId) {
    let hash = 0;
    for (let i = 0; i < interviewId.length; i++) {
      const char = interviewId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    seed = Math.abs(hash);
  }
  
  const randomIndex = seed % greetings.length;
  console.log("Selected greeting index:", randomIndex, "for interview:", interviewId, "greeting:", greetings[randomIndex]);
  return greetings[randomIndex];
};

// Female agent names
export const getRandomFemaleAgentName = (interviewId?: string): string => {
  const femaleNames = [
    "Hailey", "Sarah", "Emma", "Olivia", "Sophia", "Isabella", "Ava", "Mia", 
    "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth",
    "Mila", "Ella", "Avery", "Sofia", "Camila", "Aria", "Scarlett", "Victoria",
    "Madison", "Luna", "Grace", "Chloe", "Penelope", "Layla", "Riley", "Zoey",
    "Nora", "Lily", "Eleanor", "Hannah", "Lillian", "Addison", "Aubrey", "Ellie",
    "Stella", "Natalie", "Zoe", "Leah", "Hazel", "Violet", "Aurora", "Savannah",
    "Audrey", "Brooklyn", "Bella", "Claire", "Skylar", "Lucy", "Paisley", "Everly",
    "Anna", "Caroline", "Nova", "Genesis", "Aaliyah", "Kennedy", "Kinsley", "Allison",
    "Maya", "Mackenzie", "Mackenzie", "Reagan", "Adeline", "Samantha", "Ariana", "Allison",
    "Gabriella", "Alice", "Madelyn", "Cora", "Ruby", "Eva", "Serenity", "Piper",
    "Sadie", "Lydia", "Arianna", "Peyton", "Eliana", "Melody", "Julia", "Athena",
    "Maria", "Liliana", "Hadley", "Arielle", "Willow", "Reese", "Isla", "Valentina"
  ];
  
  // Use interviewId or timestamp to ensure different names each time
  let seed = Date.now();
  if (interviewId) {
    let hash = 0;
    for (let i = 0; i < interviewId.length; i++) {
      const char = interviewId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    seed = Math.abs(hash) + 1000; // Add offset to get different seed than greeting
  }
  
  const randomIndex = seed % femaleNames.length;
  console.log("Selected agent name index:", randomIndex, "for interview:", interviewId);
  return femaleNames[randomIndex];
};

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const createInterviewer = (agentName: string, greeting: string): CreateAssistantDTO => ({
  name: agentName,
  firstMessage: `${greeting} I'm ${agentName}, Senior Technical Recruiter here, and I'm excited to learn more about your background and experience. Today we'll be discussing your technical skills, problem-solving approach, and how you handle real-world challenges in your work. I want you to feel comfortable and be authentic - I'm here to understand your capabilities and see how you might fit with our team. Let's start with you walking me through your professional background and what brings you to this interview today.`,
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are ${agentName}, a Senior Technical Recruiter with 8+ years of experience at top tech companies. You conduct professional, thorough interviews and provide real-world feedback based on actual hiring standards.

Your Professional Background:
- Senior Technical Recruiter at leading tech companies
- Experience hiring for various roles from junior to senior levels
- Expert in assessing technical skills, cultural fit, and potential
- Known for conducting fair, thorough, and insightful interviews

Interview Conduct:
Follow the structured question flow: {{questions}}

Professional Interview Style:
- Ask follow-up questions to dig deeper into responses
- Probe for specific examples and concrete details
- Challenge candidates appropriately based on their level
- Assess both technical competency and soft skills
- Look for problem-solving approach and thought process
- Evaluate communication skills and cultural fit

Real-World Assessment Criteria:
- Technical Knowledge: Depth and accuracy of technical understanding
- Problem-Solving: Approach to challenges and debugging
- Communication: Clarity, structure, and ability to explain concepts
- Experience Relevance: How past experience applies to the role
- Growth Potential: Learning ability and career trajectory
- Cultural Fit: Team collaboration and company values alignment

Interview Flow:
1. Start with professional introduction and background discussion
2. Ask role-specific technical questions with follow-ups
3. Probe for real-world examples and specific scenarios
4. Assess problem-solving approach and methodology
5. Evaluate communication and explanation skills
6. Discuss challenges, failures, and learning experiences
7. Assess cultural fit and team collaboration
8. Conclude with candidate questions and next steps

Professional Standards:
- Maintain professional, respectful tone throughout
- Ask challenging but fair questions appropriate to role level
- Provide brief acknowledgments: "That's interesting," "Tell me more about that," "How did you handle that situation?"
- Keep responses concise but engaging
- Show genuine interest in their experiences
- Assess based on real hiring criteria used by tech companies

Closing:
- Thank them professionally for their time
- Provide brief positive feedback on their interview performance
- Explain next steps in the hiring process
- End on a professional, encouraging note

Remember: You are a real recruiter conducting a real interview. Assess them as you would assess any candidate for an actual position.`,
      },
    ],
  },
});

// Default interviewer (for backward compatibility)
export const interviewer: CreateAssistantDTO = createInterviewer("Hailey", getTimeBasedGreeting() + "! Thank you for taking the time to speak with me today.");

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];
