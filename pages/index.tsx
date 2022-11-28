import Head from "next/head";
import { useRef, useState, useEffect } from "react";
import "@tensorflow/tfjs";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import Webcam from "react-webcam";
import Hands from "../components/Hands";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const modelRef = useRef<null | handPoseDetection.HandDetector>(null);
  const predictionsRef = useRef<handPoseDetection.Hand[]>([]);
  const [ready, setReady] = useState(false);
  const lostCountRef = useRef(0);

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
          <Canvas>
            {ready && (
              <Hands
                webcam={webcamRef.current as Webcam}
                model={modelRef.current as handPoseDetection.HandDetector}
                predictionsRef={predictionsRef}
                lostCountRef={lostCountRef}
              />
            )}
          </Canvas>
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
