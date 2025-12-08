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
  gender: { value: string };
  age: { value: number };
  beauty: FacePPBeauty;
  skinstatus: FacePPSkinStatus;
  facequality: { value: number; threshold: number };
  headpose: {
    pitch_angle: number;
    roll_angle: number;
    yaw_angle: number;
  };
  emotion: {
    anger: number;
    disgust: number;
    fear: number;
    happiness: number;
    neutral: number;
    sadness: number;
    surprise: number;
  };
}

interface FacePPLandmark {
  [key: string]: { x: number; y: number };
}

interface FacePPFace {
  face_token: string;
  face_rectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  landmark: FacePPLandmark;
  attributes: FacePPAttributes;
}

interface FacePPDetectResponse {
  faces: FacePPFace[];
  image_id: string;
  request_id: string;
  time_used: number;
  error_message?: string;
}

// Helper function to convert image to base64
async function imageToBase64(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:")) {
    return imageUrl.split(",")[1];
  }
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Calculate symmetry score from facial landmarks
function calculateSymmetryScore(landmark: FacePPLandmark): number {
  if (!landmark) return 75;

  const leftEye = landmark.left_eye_center || landmark.left_eye_left_corner;
  const rightEye = landmark.right_eye_center || landmark.right_eye_right_corner;
  const noseTip = landmark.nose_tip;
  const mouthLeft = landmark.mouth_left_corner;
  const mouthRight = landmark.mouth_right_corner;

  if (!leftEye || !rightEye || !noseTip) return 75;

  const midlineX = noseTip.x;
  const leftEyeDistance = Math.abs(leftEye.x - midlineX);
  const rightEyeDistance = Math.abs(rightEye.x - midlineX);
  const eyeSymmetry =
    1 - Math.abs(leftEyeDistance - rightEyeDistance) / Math.max(leftEyeDistance, rightEyeDistance, 1);

  let mouthSymmetry = 1;
  if (mouthLeft && mouthRight) {
    const mouthLeftDist = Math.abs(mouthLeft.x - midlineX);
    const mouthRightDist = Math.abs(mouthRight.x - midlineX);
    mouthSymmetry =
      1 - Math.abs(mouthLeftDist - mouthRightDist) / Math.max(mouthLeftDist, mouthRightDist, 1);
  }

  const symmetryScore = eyeSymmetry * 0.6 + mouthSymmetry * 0.4;
  return Math.min(100, Math.max(0, 50 + symmetryScore * 50));
}

// Calculate facial proportions score (golden ratio analysis)
function calculateProportionsScore(
  landmark: FacePPLandmark,
  faceRect: { width: number; height: number }
): number {
  if (!landmark) return 70;

  const chin = landmark.chin;
  const noseTip = landmark.nose_tip;
  const leftEye = landmark.left_eye_center;
  const rightEye = landmark.right_eye_center;

  if (!chin || !noseTip || !leftEye || !rightEye) return 70;

  const faceHeight = faceRect.height;
  const noseToChindist = Math.abs(chin.y - noseTip.y);
  const upperFaceRatio = noseToChindist / faceHeight;

  const idealThirdRatio = 0.33;
  const proportionScore = 1 - Math.abs(upperFaceRatio - idealThirdRatio) / idealThirdRatio;

  const eyeDistance = Math.abs(rightEye.x - leftEye.x);
  const eyeRatio = eyeDistance / faceRect.width;
  const idealEyeRatio = 0.3;
  const eyeProportionScore = 1 - Math.abs(eyeRatio - idealEyeRatio) / idealEyeRatio;

  const combinedScore = proportionScore * 0.5 + eyeProportionScore * 0.5;
  return Math.min(100, Math.max(0, 50 + combinedScore * 50));
}

// Map Face++ skin status to skin health score
function calculateSkinScore(skinStatus: FacePPSkinStatus): number {
  if (!skinStatus) return 70;

  const healthScore = skinStatus.health || 50;
  const stainPenalty = (skinStatus.stain || 0) * 0.3;
  const acnePenalty = (skinStatus.acne || 0) * 0.4;
  const darkCirclePenalty = (skinStatus.dark_circle || 0) * 0.3;

  const skinScore = healthScore - stainPenalty - acnePenalty - darkCirclePenalty;
  return Math.min(100, Math.max(0, skinScore));
}

// Derive jawline score from face proportions and symmetry
function calculateJawlineScore(
  landmark: FacePPLandmark,
  faceRect: { width: number; height: number }
): number {
  if (!landmark) return 70;

  const chin = landmark.chin || landmark.contour_chin;
  const leftJaw = landmark.contour_left1 || landmark.contour_left2;
  const rightJaw = landmark.contour_right1 || landmark.contour_right2;

  if (!chin) return 70;

  // Estimate jaw definition based on face width to height ratio
  const faceRatio = faceRect.width / faceRect.height;
  // Ideal masculine ratio is around 0.8
  const idealRatio = 0.8;
  const ratioScore = 1 - Math.abs(faceRatio - idealRatio) / idealRatio;

  // Check jaw symmetry if landmarks available
  let jawSymmetry = 1;
  if (leftJaw && rightJaw && chin) {
    const leftDist = Math.sqrt(
      Math.pow(leftJaw.x - chin.x, 2) + Math.pow(leftJaw.y - chin.y, 2)
    );
    const rightDist = Math.sqrt(
      Math.pow(rightJaw.x - chin.x, 2) + Math.pow(rightJaw.y - chin.y, 2)
    );
    jawSymmetry = 1 - Math.abs(leftDist - rightDist) / Math.max(leftDist, rightDist, 1);
  }

  const score = ratioScore * 0.6 + jawSymmetry * 0.4;
  return Math.min(100, Math.max(0, 50 + score * 50));
}

// Calculate cheekbone score
function calculateCheekboneScore(
  landmark: FacePPLandmark,
  faceRect: { width: number; height: number }
): number {
  if (!landmark) return 70;

  const leftCheek = landmark.contour_left3 || landmark.contour_left4;
  const rightCheek = landmark.contour_right3 || landmark.contour_right4;
  const noseTip = landmark.nose_tip;

  if (!leftCheek || !rightCheek || !noseTip) return 70;

  // Calculate cheekbone prominence based on width at cheek level vs nose
  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);
  const cheekProminence = cheekWidth / faceRect.width;

  // Higher prominence is generally better (0.7-0.85 is ideal)
  const idealProminence = 0.77;
  const prominenceScore = 1 - Math.abs(cheekProminence - idealProminence) / idealProminence;

  return Math.min(100, Math.max(0, 50 + prominenceScore * 50));
}

// Calculate eye area score
function calculateEyeAreaScore(landmark: FacePPLandmark): number {
  if (!landmark) return 70;

  const leftEyeLeft = landmark.left_eye_left_corner;
  const leftEyeRight = landmark.left_eye_right_corner;
  const leftEyeTop = landmark.left_eye_top;
  const leftEyeBottom = landmark.left_eye_bottom;

  if (!leftEyeLeft || !leftEyeRight || !leftEyeTop || !leftEyeBottom) return 70;

  // Calculate eye aspect ratio (width to height)
  const eyeWidth = Math.abs(leftEyeRight.x - leftEyeLeft.x);
  const eyeHeight = Math.abs(leftEyeBottom.y - leftEyeTop.y);
  const aspectRatio = eyeWidth / eyeHeight;

  // Ideal eye ratio is around 2.5-3.0 (almond shape)
  const idealRatio = 2.75;
  const ratioScore = 1 - Math.abs(aspectRatio - idealRatio) / idealRatio;

  return Math.min(100, Math.max(0, 50 + ratioScore * 50));
}

// Get tier label from score
function getTierLabel(score: number): string {
  let tier = TIER_MAP[0].label;
  for (const t of TIER_MAP) {
    if (score >= t.min) {
      tier = t.label;
    }
  }
  return tier;
}

// Generate improvement recommendations
function generateImprovements(
  skinScore: number,
  jawlineScore: number,
  eyeScore: number,
  cheekboneScore: number,
  overallScore: number
): AnalysisResult["improvements"] {
  const improvements: AnalysisResult["improvements"] = [];

  // Sort by lowest scores to prioritize
  const scores = [
    { area: "Skin Quality", score: skinScore, advice: "Focus on a consistent skincare routine with cleansing, moisturizing, and SPF. Consider adding retinol or vitamin C serums for improved texture.", priority: "High" as const },
    { area: "Jawline Definition", score: jawlineScore, advice: "Reduce body fat to reveal jaw structure. Practice mewing and consider facial exercises to strengthen jaw muscles.", priority: "High" as const },
    { area: "Eye Area", score: eyeScore, advice: "Ensure adequate sleep (7-9 hours) to reduce dark circles. Use eye creams with caffeine or peptides. Stay hydrated.", priority: "Medium" as const },
    { area: "Cheekbone Definition", score: cheekboneScore, advice: "Lower overall body fat to reveal bone structure. Some find facial massage or gua sha helpful for lymphatic drainage.", priority: "Medium" as const },
  ];

  // Sort by score (lowest first) and take top 3
  scores.sort((a, b) => a.score - b.score);

  for (let i = 0; i < Math.min(3, scores.length); i++) {
    const item = scores[i];
    improvements.push({
      area: item.area,
      advice: item.advice,
      priority: item.score < 60 ? "High" : item.score < 75 ? "Medium" : "Low",
    });
  }

  return improvements;
}

// Generate feedback based on scores
function generateFeedback(
  overallScore: number,
  skinScore: number,
  jawlineScore: number,
  eyeScore: number
): string[] {
  const feedback: string[] = [];

  if (overallScore >= 80) {
    feedback.push("Excellent facial harmony and structure detected.");
  } else if (overallScore >= 65) {
    feedback.push("Good facial proportions with room for optimization.");
  } else {
    feedback.push("Analysis complete. Several areas identified for improvement.");
  }

  if (skinScore >= 80) feedback.push("Skin quality is above average.");
  if (jawlineScore >= 80) feedback.push("Strong jawline definition detected.");
  if (eyeScore >= 80) feedback.push("Well-proportioned eye area.");

  return feedback;
}

// Main analysis function using Face++ API
export async function analyzeFace(base64Data: string): Promise<AnalysisResult> {
  if (!FACEPP_API_KEY || !FACEPP_API_SECRET) {
    throw new Error(
      "Face++ API credentials not configured. Please set VITE_FACEPP_API_KEY and VITE_FACEPP_API_SECRET."
    );
  }

  try {
    // Prepare form data for Face++ API
    const formData = new FormData();
    formData.append("api_key", FACEPP_API_KEY);
    formData.append("api_secret", FACEPP_API_SECRET);
    formData.append("image_base64", base64Data);
    formData.append(
      "return_attributes",
      "gender,age,beauty,skinstatus,facequality,headpose,emotion"
    );
    formData.append("return_landmark", "2"); // Get detailed landmarks

    // Call Face++ Detect API
    const response = await fetch(FACEPP_API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Face++ API error: ${response.status} ${response.statusText}`);
    }

    const data: FacePPDetectResponse = await response.json();

    if (data.error_message) {
      throw new Error(`Face++ API error: ${data.error_message}`);
    }

    if (!data.faces || data.faces.length === 0) {
      throw new Error("No face detected in the image. Please ensure the image contains a clear, visible face.");
    }

    // Use the first detected face
    const face = data.faces[0];
    const attrs = face.attributes;

    // Calculate scores
    const gender = attrs.gender?.value || "Male";
    const beautyScore = gender === "Male" ? attrs.beauty?.male_score : attrs.beauty?.female_score;
    const attractiveness = beautyScore || 70;

    const skinScore = calculateSkinScore(attrs.skinstatus);
    const symmetry = calculateSymmetryScore(face.landmark);
    const proportions = calculateProportionsScore(face.landmark, face.face_rectangle);
    const jawlineScore = calculateJawlineScore(face.landmark, face.face_rectangle);
    const cheekboneScore = calculateCheekboneScore(face.landmark, face.face_rectangle);
    const eyeAreaScore = calculateEyeAreaScore(face.landmark);

    // Calculate overall score (weighted average)
    const overallScore =
      attractiveness * 0.3 +
      skinScore * 0.15 +
      symmetry * 0.15 +
      proportions * 0.1 +
      jawlineScore * 0.15 +
      eyeAreaScore * 0.15;

    // Calculate potential (slightly higher than overall, capped at 100)
    const potentialScore = Math.min(100, overallScore + 5 + Math.random() * 10);

    // Calculate masculinity based on jawline, proportions and beauty score
    const masculinityScore = (jawlineScore * 0.4 + proportions * 0.3 + attractiveness * 0.3);

    const tier = getTierLabel(overallScore);
    const feedback = generateFeedback(overallScore, skinScore, jawlineScore, eyeAreaScore);
    const improvements = generateImprovements(skinScore, jawlineScore, eyeAreaScore, cheekboneScore, overallScore);

    const result: AnalysisResult = {
      scores: {
        overall: Math.round(overallScore),
        potential: Math.round(potentialScore),
        masculinity: Math.round(masculinityScore),
        jawline: Math.round(jawlineScore),
        skinQuality: Math.round(skinScore),
        cheekbones: Math.round(cheekboneScore),
        eyeArea: Math.round(eyeAreaScore),
      },
      tier,
      feedback,
      improvements,
    };

    return result;
  } catch (error) {
    console.error("Face++ analysis error:", error);
    throw error;
  }
}

// Compare two faces using Face++ scores
export async function compareFaces(
  base64Image1: string,
  base64Image2: string
): Promise<MogResult> {
  try {
    // Analyze both faces
    const [result1, result2] = await Promise.all([
      analyzeFace(base64Image1),
      analyzeFace(base64Image2),
    ]);

    const score1 = result1.scores.overall;
    const score2 = result2.scores.overall;
    const scoreDiff = Math.abs(score1 - score2);

    // Determine winner (0 = left/image1, 1 = right/image2)
    const winnerIndex: 0 | 1 = score1 >= score2 ? 0 : 1;
    const winnerResult = winnerIndex === 0 ? result1 : result2;
    const loserResult = winnerIndex === 0 ? result2 : result1;

    // Generate winner title based on score difference
    let winnerTitle: string;
    if (scoreDiff >= 20) {
      winnerTitle = "TOTAL DOMINATION";
    } else if (scoreDiff >= 10) {
      winnerTitle = "CLEAR VICTORY";
    } else if (scoreDiff >= 5) {
      winnerTitle = "SOLID WIN";
    } else {
      winnerTitle = "CLOSE CALL";
    }

    // Find the main advantage
    const metrics = ["jawline", "skinQuality", "eyeArea", "cheekbones", "masculinity"] as const;
    let bestAdvantage = "";
    let bestDiff = 0;

    for (const metric of metrics) {
      const diff = winnerResult.scores[metric] - loserResult.scores[metric];
      if (diff > bestDiff) {
        bestDiff = diff;
        bestAdvantage = metric;
      }
    }

    const metricLabels: Record<string, string> = {
      jawline: "jawline definition",
      skinQuality: "skin quality",
      eyeArea: "eye area",
      cheekbones: "cheekbone structure",
      masculinity: "masculine features",
    };

    const reason = bestAdvantage
      ? `Superior ${metricLabels[bestAdvantage] || bestAdvantage} gave them the edge.`
      : "Slightly better overall facial harmony.";

    // Generate a roast for the loser
    const roasts = [
      "Maybe try a paper bag next time?",
      "At least you have a great personality... probably.",
      "The camera wasn't the problem here.",
      "Genetics said 'not today.'",
      "Some faces are made for radio.",
      "You tried, and that's what matters. Kind of.",
      "Keep that confidence, you'll need it.",
    ];
    const roast = roasts[Math.floor(Math.random() * roasts.length)];

    return {
      winnerIndex,
      winnerTitle,
      diffScore: Math.round(scoreDiff),
      reason,
      roast,
    };
  } catch (error) {
    console.error("Face++ comparison error:", error);
    throw error;
  }
}

// Export for API key validation
export function isFacePPConfigured(): boolean {
  return Boolean(FACEPP_API_KEY && FACEPP_API_SECRET);
}
