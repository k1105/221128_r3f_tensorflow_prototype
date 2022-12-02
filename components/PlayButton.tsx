import { useState, MutableRefObject } from "react";

export default function PlayButton() {
  const [pause, setPause] = useState<boolean>(true);

  return (
    <>
      <button onClick={() => {}}>Play Recorded Motion</button>
    </>
  );
}
