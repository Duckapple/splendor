export function shuffled<T>(sourceArr: T[]): T[] {
  const arr = [...sourceArr];
  for (let i = 0; i < arr.length; i++) {
    const arrI = arr[i];
    const i2 = Math.round(Math.random() * (arr.length - 1));
    arr[i] = arr[i2];
    arr[i2] = arrI;
  }
  return arr;
}

export function range<T extends number>(
  length: T
): number[] & { length: typeof length } {
  return Array(length).map((_, i) => i) as any;
}
