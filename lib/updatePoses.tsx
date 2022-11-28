import { calcAverageKeypoints } from "./calcAverageKeypoints";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

type Props = {
  predictions: handPoseDetection.Hand[];
  poses: [handPoseDetection.Keypoint[][], handPoseDetection.Keypoint[][]];
};

export const updatePoses = ({
  predictions,
  poses,
}: Props): [
  [handPoseDetection.Keypoint[][], handPoseDetection.Keypoint[][]],
  handPoseDetection.Keypoint[][]
] => {
  const hands: handPoseDetection.Keypoint[][] = [];
  for (let index = 0; index < predictions.length; index++) {
    //index===0: 最初に認識された手, index===1: 次に認識された手
    poses[index].push(
      predictions[index].keypoints3D as { x: number; y: number; z: number }[]
    );
    if (poses[index].length > 5) {
      poses[index].shift();
    }
    //@ts-ignore
    hands.push(calcAverageKeypoints(poses[index]));
  }
  return [poses, hands];
};
