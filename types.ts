
export interface IPDResult {
  ipdMm: number;
  limbusDistanceMm: number;
  pupilDistanceMm: number;
  confidence: number;
  confidenceInterval: string;
  rightOuterLimbus: [number, number];
  leftInnerLimbus: [number, number];
  rightPupilCenter: [number, number];
  leftPupilCenter: [number, number];
  pixelDistanceLimbus: number;
  pixelDistancePupil: number;
  scalingFactor: number;
  calibrationUsed: 'bio_metric' | 'proportional_rule' | 'reference_object';
  explanation: string;
}

export interface BiometricResult {
  verified: boolean;
  identityScore: number;
  spatialHash: string;
  livenessVerified: boolean;
  depthIntegrity: number;
  remarks: string;
}

export type ScanStatus = 'idle' | 'capturing' | 'analyzing' | 'completed' | 'error' | 'authenticating' | 'authorized';
