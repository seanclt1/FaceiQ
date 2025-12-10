import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ChatMessage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        overall: { type: Type.NUMBER, description: "Overall facial aesthetics score out of 100" },
        potential: { type: Type.NUMBER, description: "Potential max score with improvements out of 100" },
        masculinity: { type: Type.NUMBER, description: "Masculinity rating out of 100" },
        jawline: { type: Type.NUMBER, description: "Jawline definition score out of 100" },
        skinQuality: { type: Type.NUMBER, description: "Skin health and clarity score out of 100" },
        cheekbones: { type: Type.NUMBER, description: "Cheekbone prominence score out of 100" },
        eyeArea: { type: Type.NUMBER, description: "Eye area/Canthal tilt score out of 100" },
      },
      required: ["overall", "potential", "masculinity", "jawline", "skinQuality", "cheekbones", "eyeArea"]
    },
    tier: {
      type: Type.STRING,
      description: "The lookism tier (e.g., 'Chad Lite', 'High Tier Normie', 'Sub 5')."
    },
    feedback: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 bullet points of direct, brutal, unbiased feedback."
    },
    improvements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING },
          advice: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        }
      }
    }
  },
  required: ["scores", "tier", "feedback", "improvements"]
};

export const analyzeFace = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `You are FaceiQ, an expert aesthetic consultant and looksmaxxing coach. 
            Analyze this face strictly based on objective beauty standards (golden ratio, symmetry, sexual dimorphism).
            Be harsh but fair. No sugar coating.
            
            Determine the user's specific "Tier" from this list based on their Overall score:
            - Sub 5 (<50)
            - Low Tier Normie (50-60)
            - Mid Tier Normie (60-70)
            - High Tier Normie (70-80)
            - Chad Lite (80-90)
            - Chad (90-95)
            - True Adam (>95)

            Provide scores out of 100. Potential must be higher than Overall.
            Return strictly JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("Analysis failed:", error);
    // Fallback mock for demonstration if API fails or quota exceeded
    return {
        scores: { overall: 0, potential: 0, masculinity: 0, jawline: 0, skinQuality: 0, cheekbones: 0, eyeArea: 0 },
        tier: "Error",
        feedback: ["Could not analyze image. Please try again."],
        improvements: []
    };
  }
};

export const getCoachResponse = async (
  message: string, 
  history: ChatMessage[],
  analysisContext?: AnalysisResult | null
): Promise<string> => {
  try {
    const contextString = analysisContext 
      ? `User Context: Overall Score ${analysisContext.scores.overall}, Tier: ${analysisContext.tier}. Weak points: ${analysisContext.improvements.map(i => i.area).join(', ')}.`
      : "User has not been analyzed yet. Ask them to scan their face.";

    const historyText = history.map(h => `${h.role}: ${h.text}`).join('\n');

    const prompt = `
      System: You are 'Coach Chad', an elite aesthetics and looksmaxxing expert. 
      Your goal is to help the user maximize their facial potential.
      Keep answers short (under 50 words), punchy, and use terminology like 'positive canthal tilt', 'forward growth', 'mewing', 'hunter eyes', etc.
      Focus on actionable advice. Do not be overly polite. Be a coach.
      
      ${contextString}

      Current Conversation:
      ${historyText}

      User: ${message}
      Model:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Focus on the basics: Mewing, chewing, and sleep.";
  } catch (error) {
    console.error("Coach error:", error);
    return "I'm analyzing another face right now. Try again in a second.";
  }
};