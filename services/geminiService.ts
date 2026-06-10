import { Type } from "@google/genai";

/**
 * High-speed pre-calibration for real-time UI feedback.
 */
export async function preCalibrateIPD(base64Image) {
  const response = await fetch('/api/pre-calibrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image })
  });
  return response.json();
}

/**
 * Spatial Biometric Authentication.
 */
export async function verifyBiometricIdentity(base64Image) {
  const response = await fetch('/api/verify-identity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image })
  });
  return response.json();
}

/**
 * Clinical grade IPD analysis using Structured Light Lattice.
 */
export async function analyzeIPD(base64Image) {
  const response = await fetch('/api/analyze-ipd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image })
  });
  return response.json();
}

export async function chatWithExpert(message, history, ipd, base64Image) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, ipd, base64Image })
  });
  const data = await response.json();
  return data.text;
}