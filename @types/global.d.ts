type Frame = {
  keypoints: number[];
  keypoints3D: (number | undefined)[];
  handedness: "Right" | "Left";
  score: number;
  timestamp: number;
};
