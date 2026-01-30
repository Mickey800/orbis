import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * High-speed pre-calibration for real-time UI feedback.
 */
export async function preCalibrateIPD(base64Image) {
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: {
      parts: [
        {
          text: "Quickly estimate the interpupillary distance (IPD) in mm for the person in this image. Return ONLY a JSON object: { \"ipdMm\": number }"
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return { ipdMm: typeof result.ipdMm === 'number' ? result.ipdMm : 63.0 };
  } catch (e) {
    return { ipdMm: 63.0 };
  }
}

/**
 * Spatial Biometric Authentication.
 */
export async function verifyBiometricIdentity(base64Image) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          text: `Act as a Biometric Security Architect. 
          Analyze this frame captured during a structured-light IR dot projection scan.
          Return a JSON object: { verified: boolean, identityScore: number, spatialHash: string, livenessVerified: boolean, depthIntegrity: number, remarks: string }`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    },
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
}

/**
 * Clinical grade IPD analysis using Structured Light Lattice.
 */
export async function analyzeIPD(base64Image) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          text: `Act as a Clinical Ophthalmic Engineer.
          You are provided with a frame captured under "Structured Light Infrared Dot Projection".
          
          PROCEDURE:
          1. DOT LATTICE SCALING: Use the density and distortion of the projected dots to determine facial depth. 
          2. ANATOMICAL LANDMARKING: Identify the geometric centers of the pupils (Far PD).
          3. SPATIAL RECONSTRUCTION: Map the distance between pupils in 3D space.
          4. IRIS VERIFICATION: Use the 11.7mm HVID as a secondary anchor.

          Return a JSON object containing the IPD measurement and coordinates (0-1000 scale).`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    },
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ipdMm: { type: Type.NUMBER },
          limbusDistanceMm: { type: Type.NUMBER },
          pupilDistanceMm: { type: Type.NUMBER },
          pixelDistanceLimbus: { type: Type.NUMBER },
          pixelDistancePupil: { type: Type.NUMBER },
          scalingFactor: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          confidenceInterval: { type: Type.STRING },
          rightOuterLimbus: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          leftInnerLimbus: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          rightPupilCenter: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          leftPupilCenter: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          calibrationUsed: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: [
          "ipdMm", "limbusDistanceMm", "pupilDistanceMm", 
          "rightOuterLimbus", "leftInnerLimbus", "rightPupilCenter", 
          "leftPupilCenter", "scalingFactor", "explanation", 
          "calibrationUsed", "confidenceInterval", "confidence", 
          "pixelDistanceLimbus", "pixelDistancePupil"
        ]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function chatWithExpert(message, history, ipd, base64Image) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      { parts: [{ text: `VisionMetric AI Expert. User IPD: ${ipd}mm.` }] },
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: message }
      ]}
    ],
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text || "";
}