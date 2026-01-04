
export interface IPDResult {
  ipdMm: number; // Final average
  limbusDistanceMm: number;
  pupilDistanceMm: number;
  confidence: number;
  rightOuterLimbus: [number, number];
  leftInnerLimbus: [number, number];
  rightPupilCenter: [number, number];
  leftPupilCenter: [number, number];
  pixelDistanceLimbus: number;
  pixelDistancePupil: number;
  scalingFactor: number;
  calibrationUsed: 'card' | 'average_iris' | 'estimation';
  explanation: string;
}

export type ScanStatus = 'idle' | 'capturing' | 'analyzing' | 'completed' | 'error';
