import React, { useRef, MutableRefObject, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { PixelInput } from "@tensorflow-models/hand-pose-detection/dist/shared/calculators/interfaces/common_interfaces";
import Webcam from "react-webcam";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import { Group } from "three";
import { OrbitControls, Line } from "@react-three/drei";
import Stats from "three/examples/jsm/libs/stats.module";
import { updatePoses } from "../lib/updatePoses";
import { calcDist } from "../lib/calcDist";
type Props = {
  webcam: Webcam;
  model: handPoseDetection.HandDetector;
  predictionsRef: MutableRefObject<handPoseDetection.Hand[]>;
  lostCountRef: MutableRefObject<number>;
  recordPauseRef: MutableRefObject<boolean>;
  capturePause: boolean;
  recordedFlamesRef: MutableRefObject<Frame[]>;
};

export default function RotateFingers({
  webcam,
  model,
  predictionsRef,
  lostCountRef,
  recordPauseRef,
  capturePause,
  recordedFlamesRef,
}: Props) {
  const radius: number = 1;
  const unitNum: number = 100;

  const groupRef = useRef<Group>(null);
  const elapsedTime = useRef<number>(0);
  const offsetRadian = useRef<number>(0);
  const requestRef = useRef<null | number>(null);
  const flames = useRef<
    [handPoseDetection.Keypoint[][], handPoseDetection.Keypoint[][]]
  >([[], []]);
  const correctedPoses = useRef<handPoseDetection.Keypoint[][]>([]);
  const distsRef = useRef<number[][]>([]);

  const stats: Stats = Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  const capture = useCallback(async () => {
    //webcamとmodelのインスタンスが生成されていたら
    const predictions = await model.estimateHands(
      webcam.getCanvas() as PixelInput
    ); //webcamの現時点でのフレームを取得し、ポーズ推定の結果をpredictionsに非同期で格納

    if (predictions) {
      //predictionsが存在していたら
      if (predictions.length > 0) {
        predictionsRef.current = predictions;
        lostCountRef.current = 0;
      } else {
        //画面内に検知された手指が存在しない場合
        lostCountRef.current++;
      }

      if (lostCountRef.current > 10) {
        predictionsRef.current = [];
      }
    }

    if (!capturePause) {
      requestRef.current = requestAnimationFrame(capture);
    }
  }, [lostCountRef, predictionsRef, model, webcam, capturePause]);
  useFrame((_, delta) => {
    stats.begin();
    elapsedTime.current += delta; //現在時刻の更新
    offsetRadian.current = (elapsedTime.current / 10) % (2 * Math.PI); //公転の回転角の更新

    if (!recordPauseRef.current) {
      const frame = (() => {
        const data = predictionsRef.current;
        const keypointsArray = [];
        const keypoints3DArray = [];
        for (let keypoint of data[0].keypoints) {
          keypointsArray.push(keypoint.x);
          keypointsArray.push(keypoint.y);
        }

        if (data[0].keypoints3D) {
          for (let keypoint of data[0].keypoints3D) {
            keypoints3DArray.push(keypoint.x);
            keypoints3DArray.push(keypoint.y);
            keypoints3DArray.push(keypoint.z);
          }
        }

        return {
          keypoints: keypointsArray,
          keypoints3D: keypoints3DArray,
          handedness: data[0].handedness,
          score: data[0].score,
          timestamp: delta,
        };
      })();
      recordedFlamesRef.current.push(frame);
    }

    [flames.current, correctedPoses.current] = updatePoses({
      predictions: predictionsRef.current,
      poses: flames.current,
    });

    if (predictionsRef.current.length > 0) {
      //指先と付け根の距離を計算
      const hand = correctedPoses.current[0];
      if (distsRef.current.length > unitNum) {
        distsRef.current.pop();
      }
      distsRef.current.unshift([]);
      for (let i = 0; i < 5; i++) {
        // distRefに、指先と付け根の距離をpushしていく
        distsRef.current[0].push(
          calcDist(
            {
              x: hand[4 * i + 1].x,
              y: hand[4 * i + 1].y,
              z: hand[4 * i + 1].z as number,
            },
            {
              x: hand[4 * i + 4].x,
              y: hand[4 * i + 4].y,
              z: hand[4 * i + 4].z as number,
            }
          )
        );

        if (i > 0) {
          distsRef.current[0][i] += distsRef.current[0][i - 1];
        }
      }

      if (groupRef.current !== null) {
        for (let n = 0; n < unitNum; n++) {
          if (n < distsRef.current.length) {
            // 点群を作成
            const fingerPoints: [number, number, number][] = [];
            const rad = offsetRadian.current + ((2 * Math.PI) / unitNum) * n;

            for (let i = 0; i < 11; i++) {
              if (i % 2 == 0) {
                //指先の場合
                if (i == 0) {
                  fingerPoints.push([
                    radius * Math.cos(rad),
                    0,
                    radius * Math.sin(rad),
                  ]);
                } else {
                  fingerPoints.push([
                    radius * Math.cos(rad),
                    10 * distsRef.current[n][i / 2 - 1],
                    radius * Math.sin(rad),
                  ]);
                }
              } else {
                if (i == 1) {
                  fingerPoints.push([
                    (radius + 1) * Math.cos(rad),

                    (10 * distsRef.current[n][0]) / 2,
                    (radius + 1) * Math.sin(rad),
                  ]);
                } else {
                  fingerPoints.push([
                    (radius + 1) * Math.cos(rad),
                    (10 *
                      (distsRef.current[n][(i - 1) / 2 - 1] +
                        distsRef.current[n][(i + 1) / 2 - 1])) /
                      2,
                    (radius + 1) * Math.sin(rad),
                  ]);
                }
              }
            }
            // @ts-ignore
            groupRef.current.children[n].geometry.setPositions(
              fingerPoints.flat()
            );
          }
        }
      }
    }
    stats.end();
  });

  useMemo(() => {
    //captureの開始、終了を制御する
    if (capturePause) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    } else {
      requestRef.current = requestAnimationFrame(capture);
    }
  }, [capturePause, capture]);

  return (
    <>
      <group ref={groupRef}>
        {(() => {
          const lines = [];
          for (let i = 0; i < unitNum; i++) {
            lines.push(
              <Line
                name={"line" + i}
                points={Array(33).fill(0)}
                color="red"
                position={[0, 0, 0]}
                lineWidth={10}
              />
            );
          }
          return lines;
        })()}
      </group>
      <OrbitControls />
    </>
  );
}
