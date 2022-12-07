import { useState, MutableRefObject, useMemo, useRef } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

type Frame = {
  keypoints: number[];
  keypoints3D: (number | undefined)[];
  handedness: "Right" | "Left";
  score: number;
};

type Props = {
  recordPauseRef: MutableRefObject<boolean>;
  recordedFlamesRef: MutableRefObject<Frame[]>;
};

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

export default function RecordButton({
  recordPauseRef,
  recordedFlamesRef,
}: Props) {
  const [pause, setPause] = useState<boolean>(true);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useMemo(() => {
    if (pause) {
      if (recordedFlamesRef.current.length > 0) {
        const blob = new Blob([JSON.stringify(recordedFlamesRef.current)], {
          type: "text/plain",
        });
        if (typeof window !== "undefined")
          console.log(window.navigator.msSaveBlob);
        if (typeof window !== "undefined" && window.navigator.msSaveBlob) {
          console.log("hoge");
          window.navigator.msSaveBlob(blob, "test.txt");
        } else {
          if (buttonRef.current)
            buttonRef.current.href = window.URL.createObjectURL(blob);
        }
      }
    }
  }, [pause, recordedFlamesRef]);

  if (typeof document !== "undefined") {
    document.addEventListener("keypress", (event) => {
      if (event.code === "Space") {
        recordPauseRef.current = !recordPauseRef.current;
        setPause(recordPauseRef.current);
      }
    });
  }

  return (
    <>
      <a
        ref={buttonRef}
        onClick={() => {
          recordPauseRef.current = !recordPauseRef.current;
          setPause(recordPauseRef.current);
        }}
      >
        {pause ? "Record(space)" : "Pause(space)"}
      </a>
    </>
  );
}
