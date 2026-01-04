
import { GoogleGenAI, Type } from "@google/genai";
import { IPDResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function analyzeIPD(base64Image: string): Promise<IPDResult> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Act as a specialized clinical optical measurement AI. Your task is to calculate the final Interpupillary Distance (IPD) by averaging two distinct geometric measurements.

MEASUREMENT PROTOCOL:
1. LIMBUS MEASUREMENT: Calculate the distance from the OUTER LIMBUS of the subject's RIGHT EYE to the INNER LIMBUS of the subject's LEFT EYE.
2. PUPIL MEASUREMENT: Calculate the distance from the PUPIL CENTER of the RIGHT EYE to the PUPIL CENTER of the LEFT EYE.
3. SCALING: Determine the scaling factor (mm/pixel) using a standard ID/Credit card (85.6mm) or fallback to clinical iris averages (11.7mm).
4. CALCULATION:
   - Use the Euclidean distance formula: sqrt((x2-x1)^2 + (y2-y1)^2) for both measurements in pixels.
   - Convert both to millimeters using the scaling factor.
   - Final IPD = (Limbus Millimeter Distance + Pupil Millimeter Distance) / 2.

Return the results in the specified JSON format. Ensure all 4 landmark coordinates are precise.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ipdMm: { type: Type.NUMBER, description: "The final averaged IPD in millimeters" },
          limbusDistanceMm: { type: Type.NUMBER, description: "The Limbus-to-Limbus measurement in mm" },
          pupilDistanceMm: { type: Type.NUMBER, description: "The Pupil-to-Pupil measurement in mm" },
          pixelDistanceLimbus: { type: Type.NUMBER },
          pixelDistancePupil: { type: Type.NUMBER },
          scalingFactor: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          rightOuterLimbus: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          leftInnerLimbus: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          rightPupilCenter: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          leftPupilCenter: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          calibrationUsed: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["ipdMm", "limbusDistanceMm", "pupilDistanceMm", "rightOuterLimbus", "leftInnerLimbus", "rightPupilCenter", "leftPupilCenter", "scalingFactor", "explanation"]
      }
    }
  });

  const response = await model;
  const result = JSON.parse(response.text || "{}");
  
  return result as IPDResult;
}
