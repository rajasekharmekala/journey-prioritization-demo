import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export async function delayExec<T>(
  func: Function,
  min: number,
  max: number
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve(func());
      },
      randomRange(min, max)
    );
  });
}
