import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";

export default function MessedLine() {
  const pointsRef = useRef<[number, number, number][]>([[0, 0, 0]]);
  const elapsedTime = useRef<number>(0);
  const radiusRef = useRef<number[]>([]);
  const line = useRef(null);
  const vertNum = 20; // should be vertNum % 2 == 0 && vertNum > 6.
  const minR = 3;
  const maxR = 5;
  useMemo(() => {
    pointsRef.current = [];
    for (let i = 0; i < vertNum; i++) {
      const r = i % 2 == 0 ? Math.random() * (maxR - minR) + minR : 1;
      const t = ((2 * Math.PI) / vertNum) * i;
      radiusRef.current.push(r);
      pointsRef.current.push([r * Math.cos(t), 0, r * Math.sin(t)]);
    }
    pointsRef.current.push(pointsRef.current[0]);
  }, []);
  useFrame((_, delta) => {
    elapsedTime.current += delta;

    for (let i = 0; i < vertNum; i += 2) {
      const r = radiusRef.current[i] + Math.sin(elapsedTime.current);
      const t = ((2 * Math.PI) / vertNum) * i;

      pointsRef.current[i] = [r * Math.cos(t), 0, r * Math.sin(t)];
    }
    pointsRef.current[vertNum] = pointsRef.current[0];

    //@ts-ignore
    line.current?.geometry.setPositions(pointsRef.current.flat());
  });

  return (
    <>
      <Line
        ref={line}
        points={pointsRef.current}
        color="red"
        position={[0, 0, 0]}
        lineWidth={20}
      />
      <OrbitControls />
    </>
  );
}
