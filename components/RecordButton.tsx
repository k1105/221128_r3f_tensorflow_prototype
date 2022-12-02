import { useState, MutableRefObject, useMemo } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

type Props = {
  recordPauseRef: MutableRefObject<boolean>;
  recordedFlamesRef: MutableRefObject<handPoseDetection.Hand[][]>;
};

export default function RecordButton({
  recordPauseRef,
  recordedFlamesRef,
}: Props) {
  const [pause, setPause] = useState<boolean>(true);

  useMemo(() => {
    if (pause) {
      console.log(recordedFlamesRef.current);
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
      <button
        onClick={() => {
          recordPauseRef.current = !recordPauseRef.current;
          setPause(recordPauseRef.current);
        }}
      >
        {pause ? "Record(space)" : "Pause(space)"}
      </button>
    </>
  );
}
