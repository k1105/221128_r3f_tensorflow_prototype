import { useState, MutableRefObject } from "react";

export default function ReloadModelButton() {
  const [pause, setPause] = useState<boolean>(true);

  return (
    <>
      <button onClick={() => {}}>Reload Model</button>
    </>
  );
}
