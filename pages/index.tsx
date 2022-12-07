import { useRef, useState, useEffect } from "react";
import "@tensorflow/tfjs";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import Webcam from "react-webcam";
import Hands from "../components/Hands";
import { Canvas } from "@react-three/fiber";
import Controller from "../components/Controller";

type Frame = {
  keypoints: number[];
  keypoints3D: (number | undefined)[];
  handedness: "Right" | "Left";
  score: number;
};

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const modelRef = useRef<null | handPoseDetection.HandDetector>(null);
  const predictionsRef = useRef<handPoseDetection.Hand[]>([]);
  const [ready, setReady] = useState(false);
  const lostCountRef = useRef(0);
  const recordPauseRef = useRef<boolean>(true);
  const [capturePause, setCapturePause] = useState<boolean>(false);
  const recordedFlamesRef = useRef<Frame[]>([]);

  useEffect(() => {
    const loadTensorFlow = async () => {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: "tfjs",
        modelType: "full",
      } as handPoseDetection.MediaPipeHandsTfjsModelConfig;
      modelRef.current = await handPoseDetection.createDetector(
        model,
        detectorConfig
      );
    };

    loadTensorFlow().then(() => {
      setReady(true);
    });
  }, []);

  return (
    <>
      <main>
        <div id="root">
          <Controller
            recordPauseRef={recordPauseRef}
            capturePause={capturePause}
            setCapturePause={setCapturePause}
            recordedFlamesRef={recordedFlamesRef}
          />
          {ready ? (
            <>
              <Canvas>
                <Hands
                  webcam={webcamRef.current as Webcam}
                  model={modelRef.current as handPoseDetection.HandDetector}
                  predictionsRef={predictionsRef}
                  lostCountRef={lostCountRef}
                  recordPauseRef={recordPauseRef}
                  capturePause={capturePause}
                  recordedFlamesRef={recordedFlamesRef}
                />
              </Canvas>
            </>
          ) : (
            <>loading...</>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            right: -190,
            top: -10,
          }}
        >
          <Webcam
            width="200"
            height="113"
            mirrored
            id="webcam"
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
          />
        </div>
        <div
          style={{
            backgroundColor: "rgba(23,32,23,0.3)",
            position: "absolute",
            color: "white",
            display: "flex",
            cursor: "pointer",
            top: 10,
            left: 10,
          }}
        ></div>
      </main>
    </>
  );
}
