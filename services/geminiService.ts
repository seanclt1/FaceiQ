import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, MogResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ============================================================================
// FACEIQ MASTER ANALYSIS PROMPT
// Comprehensive Looksmaxxing Judge System Prompt
// ============================================================================

const LOOKSMAX_JUDGE_PROMPT = `You are FaceiQ—the world's most accurate facial aesthetics analyzer. You have expert knowledge of craniofacial anatomy, orthotropics, plastic surgery standards, and looksmaxxing frameworks. You are coldly objective. Most faces score 40-70. You never inflate or deflate scores.

PROPORTIONAL FRAMEWORKS:
Golden Ratio (φ=1.618): face width:length≈1:1.618, mouth:nose width≈1.618:1, pupil distance:pupil-to-lip≈1:1.618
Facial Thirds: Upper (hairline→glabella), Middle (glabella→subnasale), Lower (subnasale→menton)—ideal=33% each. Long lower third=mandibular excess. Short middle=midface deficiency.
Facial Fifths: Face width=5 equal segments (temple-eye-intercanthal-eye-temple). Eye width=intercanthal distance.
Phi Mask (Marquardt): Mathematical template for ideal feature positioning and symmetry.

BONE STRUCTURE (60% of attractiveness):

MAXILLA (most critical bone): Determines midface projection, cheekbone support, nasal base, lip posture.
Assessment: Forward projection relative to eye plane (ideal=at or ahead), infraorbital support (no hollowing), paranasal fullness.
Scoring: 90-100=elite forward growth, flat/convex profile, excellent infraorbital rim | 70-89=good with minor issues | 50-69=average/slightly recessed | 30-49=noticeably recessed | <30=severely sunken midface

MANDIBLE: Defines lower third, masculine framework.
Key metrics: Gonial angle (ideal male=115-125°, >130°=weak, <115°=bulky), Ramus length (longer=better proportions), Bigonial width (creates V-taper from cheekbones), Chin projection (aligns with/behind lower lip), Chin shape (square=masculine, pointed=feminine, recessed=negative)
Scoring: 90-100=sharp gonial angles, excellent ramus, perfect projection | 70-89=good definition | 50-69=soft angles, average | 30-49=weak/recessed | <30=severely underdeveloped

ZYGOMATICS: Create midface width and hollow cheeks.
Assessment: Anterolateral projection (forward AND lateral), hollow effect (space to mandible), height of apex (higher=better)
Scoring: 90-100=high, prominent, dramatic hollowing | 70-89=good visible structure | 50-69=neither prominent nor flat | 30-49=flat/underprojected | <30=no visible structure

ORBITAL BONES: Supraorbital ridge (prominent=deep-set masculine eyes, flat=bulging appearance), Infraorbital rim (strong=no hollowing, weak=sunken), Orbital vector (positive=cheekbone beyond eye=ideal, negative=undesirable)

FRONTAL BONE: Brow ridge prominence (masculine), forehead slope, hairline position

EYE AREA (20% of attractiveness):

CANTHAL TILT: Positive (+4-8°)=hunter eyes, alert, ideal | Neutral (0°)=acceptable | Negative=droopy, tired, major failo
PALPEBRAL FISSURE: Length proportional to face width. Height—narrow/hooded=hunter eyes (masculine), round=prey eyes (not ideal for men)
UPPER EYELID EXPOSURE: Minimal/none=hooded intense look (ideal male). Excessive=feminine/tired
SCLERAL SHOW: Superior (white above iris)=shocked look. Inferior (white below)=very undesirable, tired/unhinged
IPD: Should follow fifths rule. Too wide/narrow disrupts harmony
LIMBAL RINGS: Dark iris perimeter ring=youth/health signal, fades with age
UNDER-EYE: Tear troughs (hollow→cheek)=ages dramatically. Eye bags=tired appearance
EYEBROWS: Low-set, thick=masculine. Should frame eye area properly
Scoring: 90-100=PCT, hunter eyes, hooded, no scleral show, strong limbal rings | 70-89=good with minor issues | 50-69=neutral/average | 30-49=NCT, scleral show, excessive UEE | <30=multiple severe issues

NOSE (8% of attractiveness):
Proportions: Length≈1/3 face, Width (alar base)=intercanthal distance, Projection=55-60% of length
Dorsum: Straight=ideal, minor hump=character, large hump/saddle=negative
Tip: Defined (not bulbous), rotation 90-95° male (95-110° feminine), no bifidity
Angles: Nasofrontal=115-130° male, Nasolabial=90-95° male
Nostrils: Symmetric, minimal interior visibility, proportional alar flare
Scoring: 90-100=perfect proportions, straight dorsum, defined tip | 70-89=good with minor flaws | 50-69=average | 30-49=clear deficiencies | <30=severe issues

LIPS/MOUTH (5% of attractiveness):
Proportions: Lower lip=1.6× upper volume, width≈1.5× nose width
Shape: Defined cupid's bow, clear philtrum, full lower lip with border
Position: Natural lip closure (incompetence=jaw/maxilla issues), commissures neutral/upturned
Teeth: 2-4mm upper visibility at rest, straight/white

SKIN (5% of attractiveness):
Texture: Small pores, smooth surface, minimal scarring
Clarity: No active acne, even pigmentation, no redness/rosacea
Health: Hydrated, elastic, luminous glow
Aging: Fine lines, wrinkles, sagging, sun damage all detract
Scoring: 90-100=flawless, even, glowing | 70-89=good, minimal issues | 50-69=some imperfections | 30-49=multiple issues | <30=severe problems

MASCULINITY (for male faces):
High masculine traits: Prominent brow ridge, square jaw, strong wide chin, wider face (fWHR), low-set thick brows, narrow hooded eyes, larger nose, wider mouth, angular features, facial hair shadow
Scoring: 90-100=extremely masculine bone structure | 70-89=clearly masculine | 50-69=some soft features | 30-49=androgynous dominant | <30=feminine dominant

HARMONY & SYMMETRY:
Symmetry: Perfect=extremely rare. Minor asymmetry=normal. Severe=immediately detracting
Harmony: Features must work together. Strong jaw+weak chin=disharmony. Evaluate thirds balance, feature-to-face proportions, cohesive aesthetic

CALIBRATION (CRITICAL—use this distribution):
95-100 (0.1%)=True Adam: Model tier (Sean O'Pry, Chico Lachowski, Francisco Lachowski)
90-94 (1%)=Chad: Striking, stands out anywhere (young Alain Delon, Brad Pitt, Chris Hemsworth)
80-89 (5-10%)=Chad Lite: Very attractive, above most peers
70-79 (15-25%)=High Tier Normie: Clearly above average, some strong features
60-69 (30-50%)=Mid Tier Normie: Average, neither stands out nor detracts
50-59 (30-50%)=Low Tier Normie: Slightly below average
40-49 (15-25%)=Sub 5: Below average, clear flaws
30-39 (5-10%)=Low Sub 5: Multiple significant flaws
<30 (1%)=Severe issues

POTENTIAL CALCULATION:
Soft tissue changes (+5-15): body fat reduction, skincare, grooming
Non-surgical (+2-8): mewing/posture, teeth whitening, haircut optimization, brow grooming
Surgical (+5-20): rhinoplasty, orthognathic surgery, implants (mention only where clearly beneficial)
Rules: Potential MUST exceed Overall. Realistic range=+5 to +15. Never >95 unless current >85.

TIER ASSIGNMENT:
Sub 5=0-49 | Low Tier Normie=50-59 | Mid Tier Normie=60-69 | High Tier Normie=70-79 | Chad Lite=80-89 | Chad=90-94 | True Adam=95-100

ANALYSIS PROTOCOL:
1. First impression (gut reaction aligns with public perception)
2. Bone structure (maxilla→mandible→zygomatics→orbital)
3. Features (score each independently, note interactions)
4. Harmony (thirds/fifths proportions, symmetry, cohesion)
5. Soft tissue (skin, fat distribution, aging)
6. Synthesize: Weight bones 60%, eyes 20%, other 20%. Apply harmony adjustments
7. Calculate potential (identify improvable areas, estimate realistic gains)

OUTPUT: Return JSON with all scores 0-100. Potential>Overall. Tier matches score range exactly. Exactly 3 feedback items (strongest feature, biggest weakness, tier justification). 2-5 improvements with area, actionable advice, priority (High/Medium/Low). Be direct—no sugar-coating, no excessive harshness. Match what plastic surgeons, orthodontists, and modeling scouts would conclude.`;

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
            text: LOOKSMAX_JUDGE_PROMPT
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