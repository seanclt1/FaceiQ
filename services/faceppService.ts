import { AnalysisResult, MogResult, TIER_MAP } from "../types";

// Face++ API Configuration
const FACEPP_API_URL = "https://api-us.faceplusplus.com/facepp/v3/detect";
const FACEPP_API_KEY = import.meta.env.VITE_FACEPP_API_KEY || "";
const FACEPP_API_SECRET = import.meta.env.VITE_FACEPP_API_SECRET || "";

// Face++ API Response Types
interface FacePPBeauty {
  male_score: number;
  female_score: number;
}

interface FacePPSkinStatus {
  health: number;
  stain: number;
  acne: number;
  dark_circle: number;
}

interface FacePPAttributes {
  beauty: FacePPBeauty;
  age: { value: number };
  gender: { value: "Male" | "Female" };
  skinstatus: FacePPSkinStatus;
  facequality: { value: number; threshold: number };
  blur: { blurness: { value: number } };
  eyestatus: {
    left_eye_status: { normal_glass_eye_open: number; no_glass_eye_open: number };
    right_eye_status: { normal_glass_eye_open: number; no_glass_eye_open: number };
  };
  headpose: {
    pitch_angle: number;
    roll_angle: number;
    yaw_angle: number;
  };
}

interface FacePPFace {
  face_token: string;
  face_rectangle: { top: number; left: number; width: number; height: number };
  attributes: FacePPAttributes;
}

interface FacePPResponse {
  faces: FacePPFace[];
  image_id: string;
  face_num: number;
  error_message?: string;
}

/**
 * Determines the tier label based on overall score
 */
function getTierFromScore(score: number): string {
  for (let i = TIER_MAP.length - 1; i >= 0; i--) {
    if (score >= TIER_MAP[i].min) {
      return TIER_MAP[i].label;
    }
  }
  return TIER_MAP[0].label;
}

/**
 * Generate feedback based on Face++ analysis
 */
function generateFeedback(attrs: FacePPAttributes, overallScore: number): string[] {
  const feedback: string[] = [];
  const gender = attrs.gender.value;
  const beautyScore = gender === "Male" ? attrs.beauty.male_score : attrs.beauty.female_score;

  // Overall assessment
  if (overallScore >= 80) {
    feedback.push("Strong facial aesthetics. You're in the top tier of attractiveness.");
  } else if (overallScore >= 60) {
    feedback.push("Above average features with clear room for optimization.");
  } else {
    feedback.push("Below average baseline, but significant improvement potential exists.");
  }

  // Skin feedback
  const skinHealth = attrs.skinstatus.health;
  if (skinHealth < 50) {
    feedback.push(`Skin health is a weak point (${Math.round(skinHealth)}/100). Acne, texture, or dark circles are holding you back.`);
  } else if (skinHealth >= 80) {
    feedback.push(`Excellent skin quality (${Math.round(skinHealth)}/100). This is a major positive.`);
  }

  // Age-based feedback
  if (attrs.age.value < 25) {
    feedback.push("Your features are still developing. Collagen and bone structure will mature over the next few years.");
  } else if (attrs.age.value > 35) {
    feedback.push("Focus on skin maintenance and anti-aging protocols to preserve your baseline.");
  }

  // Ensure we have exactly 3 feedback items
  while (feedback.length < 3) {
    if (attrs.skinstatus.acne > 30) {
      feedback.push(`Acne detected (severity: ${Math.round(attrs.skinstatus.acne)}). Consider retinoids or professional treatment.`);
    } else if (attrs.skinstatus.dark_circle > 40) {
      feedback.push(`Dark circles are noticeable (${Math.round(attrs.skinstatus.dark_circle)}/100). Sleep optimization and eye cream recommended.`);
    } else {
      feedback.push("Maintain current grooming standards and focus on fitness for further gains.");
    }
  }

  return feedback.slice(0, 3);
}

/**
 * Generate improvement suggestions based on Face++ analysis
 */
function generateImprovements(attrs: FacePPAttributes): AnalysisResult["improvements"] {
  const improvements: AnalysisResult["improvements"] = [];
  const skin = attrs.skinstatus;

  // Skin-based improvements
  if (skin.health < 60) {
    improvements.push({
      area: "Skin Health",
      advice: "Start a consistent skincare routine: cleanser, tretinoin, moisturizer, SPF. Consider dermatologist consultation.",
      priority: skin.health < 40 ? "High" : "Medium",
    });
  }

  if (skin.acne > 25) {
    improvements.push({
      area: "Acne Treatment",
      advice: "Active acne requires intervention. Benzoyl peroxide 2.5% or prescription retinoids can clear this within 8-12 weeks.",
      priority: skin.acne > 50 ? "High" : "Medium",
    });
  }

  if (skin.dark_circle > 35) {
    improvements.push({
      area: "Dark Circles",
      advice: "Prioritize 7-9 hours of sleep. Use caffeine-based eye serum. Consider filler if genetic.",
      priority: skin.dark_circle > 60 ? "High" : "Medium",
    });
  }

  if (skin.stain > 30) {
    improvements.push({
      area: "Hyperpigmentation",
      advice: "Vitamin C serum (morning) + niacinamide can fade stains. Always use SPF 50.",
      priority: skin.stain > 50 ? "Medium" : "Low",
    });
  }

  // General improvements based on beauty score
  const beautyScore = attrs.gender.value === "Male" ? attrs.beauty.male_score : attrs.beauty.female_score;

  if (beautyScore < 70) {
    improvements.push({
      area: "Body Composition",
      advice: "Lower body fat to 10-15% to reveal facial bone structure. Lean face = higher ratings.",
      priority: "High",
    });
  }

  if (improvements.length < 3) {
    improvements.push({
      area: "Jawline Definition",
      advice: "Mewing, gum chewing, and lowering body fat will sharpen jaw definition over time.",
      priority: "Medium",
    });
  }

  if (improvements.length < 3) {
    improvements.push({
      area: "Grooming Optimization",
      advice: "Eyebrow shaping, proper haircut for face shape, and facial hair styling can add 0.5-1 points.",
      priority: "Low",
    });
  }

  return improvements.slice(0, 4);
}

/**
 * Call Face++ API to detect and analyze face
 */
async function callFacePPAPI(base64Image: string): Promise<FacePPResponse> {
  const formData = new FormData();
  formData.append("api_key", FACEPP_API_KEY);
  formData.append("api_secret", FACEPP_API_SECRET);
  formData.append("image_base64", base64Image);
  formData.append(
    "return_attributes",
    "beauty,age,gender,skinstatus,facequality,blur,eyestatus,headpose"
  );

  const response = await fetch(FACEPP_API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Face++ API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Main face analysis function - replaces Gemini analyzeFace
 */
export async function analyzeFace(base64Image: string): Promise<AnalysisResult> {
  try {
    const data = await callFacePPAPI(base64Image);

    if (!data.faces || data.faces.length === 0) {
      throw new Error("No face detected in image");
    }

    const face = data.faces[0];
    const attrs = face.attributes;
    const gender = attrs.gender.value;

    // Get beauty score based on detected gender
    const rawBeauty = gender === "Male" ? attrs.beauty.male_score : attrs.beauty.female_score;

    // Face++ scores tend to be conservative (40-70 range typically)
    // Scale to match our 0-100 expectation with better distribution
    const scaledBeauty = Math.min(100, Math.max(0, rawBeauty * 1.1));

    // Calculate derived scores
    const skinQuality = Math.round(
      (attrs.skinstatus.health * 0.4 +
        (100 - attrs.skinstatus.acne) * 0.3 +
        (100 - attrs.skinstatus.dark_circle) * 0.2 +
        (100 - attrs.skinstatus.stain) * 0.1)
    );

    // Estimate other scores based on overall beauty and skin
    // (Face++ doesn't provide jawline/cheekbone scores directly)
    const overall = Math.round(scaledBeauty * 0.7 + skinQuality * 0.3);
    const potential = Math.min(100, overall + Math.round(15 + Math.random() * 10));

    // Masculinity estimate (higher for males with higher beauty scores)
    const masculinity =
      gender === "Male"
        ? Math.round(scaledBeauty * 0.8 + 20)
        : Math.round(100 - scaledBeauty * 0.3);

    // Estimate facial feature scores (derived from overall + variance)
    const variance = () => Math.round((Math.random() - 0.5) * 15);
    const jawline = Math.min(100, Math.max(20, overall + variance()));
    const cheekbones = Math.min(100, Math.max(20, overall + variance()));
    const eyeArea = Math.min(100, Math.max(20, overall + variance()));

    const result: AnalysisResult = {
      scores: {
        overall,
        potential,
        masculinity: Math.min(100, masculinity),
        jawline,
        skinQuality,
        cheekbones,
        eyeArea,
      },
      tier: getTierFromScore(overall),
      feedback: generateFeedback(attrs, overall),
      improvements: generateImprovements(attrs),
    };

    return result;
  } catch (error) {
    console.error("Face++ analysis failed:", error);

    // Return error state that matches interface
    return {
      scores: {
        overall: 0,
        potential: 0,
        masculinity: 0,
        jawline: 0,
        skinQuality: 0,
        cheekbones: 0,
        eyeArea: 0,
      },
      tier: "Error",
      feedback: [
        error instanceof Error
          ? error.message
          : "Analysis failed. Please try a clearer photo with good lighting.",
      ],
      improvements: [],
    };
  }
}

/**
 * Compare two faces - replaces Gemini compareFaces
 */
export async function compareFaces(
  img1Base64: string,
  img2Base64: string
): Promise<MogResult> {
  try {
    // Analyze both faces in parallel
    const [data1, data2] = await Promise.all([
      callFacePPAPI(img1Base64),
      callFacePPAPI(img2Base64),
    ]);

    if (!data1.faces?.length || !data2.faces?.length) {
      throw new Error("Could not detect faces in one or both images");
    }

    const face1 = data1.faces[0].attributes;
    const face2 = data2.faces[0].attributes;

    // Get beauty scores
    const score1 =
      face1.gender.value === "Male"
        ? face1.beauty.male_score
        : face1.beauty.female_score;
    const score2 =
      face2.gender.value === "Male"
        ? face2.beauty.male_score
        : face2.beauty.female_score;

    // Calculate skin scores
    const skin1 = face1.skinstatus.health;
    const skin2 = face2.skinstatus.health;

    // Combined scores
    const total1 = score1 * 0.7 + skin1 * 0.3;
    const total2 = score2 * 0.7 + skin2 * 0.3;

    const winnerIndex: 0 | 1 = total1 >= total2 ? 0 : 1;
    const diffScore = Math.round(Math.abs(total1 - total2));

    // Determine winning feature
    let reason: string;
    const beautyDiff = Math.abs(score1 - score2);
    const skinDiff = Math.abs(skin1 - skin2);

    if (beautyDiff > skinDiff) {
      reason =
        winnerIndex === 0
          ? `Superior facial harmony (${Math.round(score1)} vs ${Math.round(score2)})`
          : `Superior facial harmony (${Math.round(score2)} vs ${Math.round(score1)})`;
    } else {
      reason =
        winnerIndex === 0
          ? `Better skin quality (${Math.round(skin1)} vs ${Math.round(skin2)})`
          : `Better skin quality (${Math.round(skin2)} vs ${Math.round(skin1)})`;
    }

    // Generate title based on margin
    let winnerTitle: string;
    if (diffScore > 20) {
      winnerTitle = "TOTAL DOMINATION";
    } else if (diffScore > 10) {
      winnerTitle = "CLEAR MOG";
    } else if (diffScore > 5) {
      winnerTitle = "SLIGHT EDGE";
    } else {
      winnerTitle = "CLOSE CALL";
    }

    // Generate roast for loser
    const loserAttrs = winnerIndex === 0 ? face2 : face1;
    const roasts: string[] = [];

    if (loserAttrs.skinstatus.acne > 30) {
      roasts.push("That skin needs more help than a dermatologist can provide.");
    }
    if (loserAttrs.skinstatus.dark_circle > 40) {
      roasts.push("Those dark circles look like you haven't slept since 2019.");
    }
    if (loserAttrs.skinstatus.health < 50) {
      roasts.push("Skin looking like it gave up before the battle started.");
    }

    const loserScore =
      loserAttrs.gender.value === "Male"
        ? loserAttrs.beauty.male_score
        : loserAttrs.beauty.female_score;

    if (loserScore < 50) {
      roasts.push("Face++ had to double-check those numbers. Twice.");
    }
    if (loserScore < 40) {
      roasts.push("The algorithm is requesting hazard pay.");
    }

    // Default roasts
    roasts.push("It's over. Time to start mewing.");
    roasts.push("Even your mirror avoids eye contact.");
    roasts.push("Certified stat-check failure.");

    const roast = roasts[Math.floor(Math.random() * Math.min(3, roasts.length))];

    return {
      winnerIndex,
      winnerTitle,
      diffScore,
      reason,
      roast,
    };
  } catch (error) {
    console.error("Face comparison failed:", error);
    return {
      winnerIndex: 0,
      winnerTitle: "ERROR",
      diffScore: 0,
      reason: "Could not compare faces",
      roast: "Try again with clearer photos.",
    };
  }
}

// Re-export the coach function from gemini service (Face++ doesn't have chat)
export { getCoachResponse } from "./geminiService";
