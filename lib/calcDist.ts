export const calcDist = (
  posA: { x: number; y: number; z: number },
  posB: { x: number; y: number; z: number }
) => {
  return Math.sqrt((posA.y - posB.y) ** 2);
};
