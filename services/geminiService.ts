import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, MogResult } from "../types";

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

const MOG_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    winnerIndex: { type: Type.INTEGER, description: "0 for the first image, 1 for the second image." },
    winnerTitle: { type: Type.STRING, description: "Short, hype title like 'MOGGED', 'DOMINATION', 'CLOSE CALL'." },
    diffScore: { type: Type.NUMBER, description: "The score difference between the two faces." },
    reason: { type: Type.STRING, description: "The specific facial feature that won the battle (e.g. 'Superior Jawline Definition')." },
    roast: { type: Type.STRING, description: "A one-sentence brutal roast for the loser." }
  },
  required: ["winnerIndex", "winnerTitle", "diffScore", "reason", "roast"]
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

export const compareFaces = async (img1Base64: string, img2Base64: string): Promise<MogResult> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: img1Base64 } },
                    { inlineData: { mimeType: 'image/jpeg', data: img2Base64 } },
                    {
                        text: `Compare these two faces based on aesthetic "Looksmaxxing" standards (Hunter eyes, Jawline, Symmetry, Dimorphism).
                        Decide who "Mogs" (dominates) the other.
                        Be extremely direct, using slang like "Mogged", "It's over", "Stat check".
                        
                        - winnerIndex: 0 (First Image) or 1 (Second Image).
                        - winnerTitle: Short impact phrase (e.g. "LEFT MOGS", "RIGHT DOMINATES").
                        - roast: Roast the loser's weakest feature.
                        `
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: MOG_SCHEMA
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as MogResult;
        }
        throw new Error("No comparison generated");
    } catch (error) {
        console.error("Comparison failed", error);
        return {
            winnerIndex: 0,
            winnerTitle: "ERROR",
            diffScore: 0,
            reason: "Could not compare",
            roast: "Try again."
        }
    }
}

export const getCoachResponse = async (message: string, history: any[]) => {
    // Basic chat interface using the flash model for speed
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an AI aesthetics coach.
Your responses must follow these rules:

Keep every answer short, simple, and direct (1–3 sentences MAX).

Write like a high-confidence Gen-Z fitness/aesthetics coach — clear, casual, no cringe.

Never write long paragraphs, explanations, or essays unless the user explicitly requests depth.

Prioritize actionable advice over theory.

No emojis unless the user uses emojis first.

Avoid filler words like “here’s the tea,” “let me explain,” or anything that slows the message.

Responses should feel quick, helpful, interesting, and easy to skim in an app UI.

Your job: Give fast answers about looksmaxxing, fitness, grooming, and style with a tight, scroll-friendly tone.`
        },
        history: history
    });

    const response = await chat.sendMessage({ message });
    return response.text;
};