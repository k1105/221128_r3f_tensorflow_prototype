import RecordButton from "../components/RecordButton";
import PlayButton from "../components/PlayButton";
import DeleteRecordButton from "../components/DeleteRecordButton";
import PauseCaptureButton from "../components/PauseCaptureButton";
import ReloadModelButton from "../components/ReloadModelButton";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

type Frame = {
  keypoints: number[];
  keypoints3D: (number | undefined)[];
  handedness: "Right" | "Left";
  score: number;
};

type Props = {
  recordPauseRef: MutableRefObject<boolean>;
  capturePause: boolean;
  setCapturePause: Dispatch<SetStateAction<boolean>>;
  recordedFlamesRef: MutableRefObject<Frame[]>;
};

export default function Controller({
  recordPauseRef,
  capturePause,
  setCapturePause,
  recordedFlamesRef,
}: Props) {
  return (
    <div>
      <RecordButton
        recordPauseRef={recordPauseRef}
        recordedFlamesRef={recordedFlamesRef}
      />
      <PlayButton />
      <DeleteRecordButton />
      <PauseCaptureButton
        capturePause={capturePause}
        setCapturePause={setCapturePause}
      />
      <ReloadModelButton />
      <style jsx>{`
        div {
          z-index: 10;
          position: absolute;
          top: 10vh;
          left: 3vw;
        }
      `}</style>
    </div>
  );
}
