
import { GoogleGenAI, Type } from "@google/genai";
import { ConfigOptions, GeneratedResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and will show a friendly error in the app
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash';

const systemInstruction = `You are an expert social media manager and a master copy editor. Your task is to analyze a social media post and craft a response in JSON format.

**Primary Goal:**
- Generate 3 distinct response variations, each with a unique title and text.
- Generate a list of 5-7 relevant hashtags.
- The entire output must conform to the provided JSON schema.

**Content Quality Guidelines (Apply to all generated text):**

**Persona and Voice:**
- Adopt a specific, engaging persona (e.g., "witty travel blogger," "seasoned expert").
- Use a conversational, authentic tone. Inject humor, passion, or wit if appropriate.
- Ensure the final text flows naturally when read aloud. If it sounds awkward to say, rewrite it.
- Make sure you're neither too self aggrandizing nor too sycophantic

**Structure and Rhythm:**
- Vary sentence length and structure. Mix short, punchy sentences with longer ones.
- Vary sentence openings. Avoid starting consecutive sentences with the same word.
- Embrace "perfect imperfection." Use contractions (it's, don't). Occasionally use sentence fragments or start sentences with "And" or "But" for stylistic effect.

**Word Choice and Diction:**
- Eliminate corporate jargon and overly formal words like "leverage," "harness," "delve," "underscore," "elucidate," "paradigm shift," or "treasure trove."
- Replace weak hedging language ("arguably," "tends to") with confident, direct statements.
- Simplify vocabulary: "utilize" becomes "use," "endeavor" becomes "try."
- Use strong, active verbs and concrete nouns.

**Content and Style:**
- Prioritize "Show, Don't Tell." Describe specific actions and sensory details.
- Avoid vague generalities. Support points with specific details or examples.
- Do not write formulaic conclusions starting with "In conclusion" or "In summary."

**Reader Engagement:**
- Engage the reader directly using "you."
- Ask rhetorical questions to provoke thought.

**Mechanics and Punctuation:**
- Use punctuation stylistically to control rhythm and add emphasis.
- Use em dashes sparingly for impactful interruptions, not simple asides.
- Use colons to introduce lists or explanations with flair.`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        variations: {
            type: Type.ARRAY,
            description: "An array of exactly 3 distinct response variations, each optimized for the target platform and adhering to all quality guidelines.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A short, descriptive title for the variation (e.g., 'The Professional Reply', 'The Casual Question', 'The Witty Comeback')."
                    },
                    text: {
                        type: Type.STRING,
                        description: "The full text of this response variation, adhering to all specified constraints and quality guidelines."
                    }
                },
                required: ["title", "text"]
            }
        },
        hashtags: {
            type: Type.ARRAY,
            description: "An array of 5-7 relevant hashtags, without the '#' symbol.",
            items: { type: Type.STRING }
        }
    },
    required: ["variations", "hashtags"]
};


export const generateAutomatedResponse = async (
  image: { data: string; mimeType: string },
  config: ConfigOptions,
  styleContent: string | null
): Promise<GeneratedResponse> => {
  if (!API_KEY) {
      throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  try {
    const baseConstraints = `
- Platform Optimization: ${config.platform}
- Desired Length: ${config.length}
- Tone: ${config.tone}
- Style: ${config.style}
- Action: ${config.action}
- Emojis: ${config.includeEmojis ? 'Include relevant emojis.' : 'Do not include emojis.'}`;

    let userPromptText: string;
    
    if (styleContent) {
        userPromptText = `Analyze the post in the image. The user has also provided a style guide to influence the response.

**STYLE GUIDE:**
${styleContent}

**INSTRUCTIONS:**
1. **Prioritize the provided Style Guide.** Analyze the writing style from the guide and strictly mimic it.
2. The other constraints are secondary to the user's personal style.

**RESPONSE CONSTRAINTS:**${baseConstraints}

Remember to apply all the quality guidelines from your system prompt and respond in the required JSON format.`;
    } else {
        userPromptText = `Analyze the post in the image.

**RESPONSE CONSTRAINTS:**${baseConstraints}

Remember to apply all the quality guidelines from your system prompt and respond in the required JSON format.`;
    }

    const imagePart = {
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    };

    const textPart = { text: userPromptText };
    
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    if (!response.text) {
        throw new Error("API returned an empty response. The content may have been blocked or the model could not generate a valid response.");
    }
    
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error('Failed to parse JSON response:', response.text);
        throw new Error("The AI returned a response in an unexpected format.");
    }

  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate response: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the AI service.');
  }
};
