import { useState, MutableRefObject, Dispatch, SetStateAction } from "react";

type Props = {
  capturePause: boolean;
  setCapturePause: Dispatch<SetStateAction<boolean>>;
};

export default function PauseCaptureButton({
  capturePause,
  setCapturePause,
}: Props) {
  return (
    <>
      <button
        onClick={() => {
          setCapturePause(!capturePause);
        }}
      >
        {capturePause ? "Resume Capture" : "Pause Capture"}
      </button>
    </>
  );
}
