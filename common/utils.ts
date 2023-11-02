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

export function range(i: number, j?: number) {
  let x = 0;
  if (j !== undefined) {
    x = i;
    i = j;
  }
  return Array(i - x)
    .fill(0)
    .map(() => x++);
}
