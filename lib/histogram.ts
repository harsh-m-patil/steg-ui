export function computeHistogram(data: Uint8ClampedArray, channel: number): number[] {
  const histogram = new Array(256).fill(0)

  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i + channel]]++
  }

  return histogram
}

/**
 * Finds the peak point (most frequent value) in a histogram
 *
 * @param histogram - The histogram array
 * @returns The intensity value with the highest frequency
 */
export function findPeakPoint(histogram: number[]): number {
  let peakPoint = 0
  let peakValue = 0

  for (let i = 0; i < 256; i++) {
    if (histogram[i] > peakValue) {
      peakValue = histogram[i]
      peakPoint = i
    }
  }

  return peakPoint
}

/**
 * Finds a suitable zero point (least frequent non-zero value) near the peak
 *
 * @param histogram - The histogram array
 * @param peakPoint - The peak point to search around
 * @param searchRange - The range to search around the peak
 * @returns The best zero point found
 */
export function findZeroPoint(histogram: number[], peakPoint: number, searchRange = 20): number {
  // Start with a point adjacent to the peak
  let zeroPoint = peakPoint > 127 ? peakPoint - 1 : peakPoint + 1
  let minValue = histogram[zeroPoint]

  // Define search boundaries
  const lowerBound = Math.max(1, peakPoint - searchRange)
  const upperBound = Math.min(254, peakPoint + searchRange)

  // Find the minimum non-zero value within range
  for (let i = lowerBound; i <= upperBound; i++) {
    if (i !== peakPoint && histogram[i] < minValue && histogram[i] > 0) {
      minValue = histogram[i]
      zeroPoint = i
    }
  }

  return zeroPoint
}

/**
 * Visualizes a histogram as a canvas element
 *
 * @param histogram - The histogram array to visualize
 * @param width - The width of the canvas
 * @param height - The height of the canvas
 * @param peakPoint - Optional peak point to highlight
 * @param zeroPoint - Optional zero point to highlight
 * @returns A canvas element with the histogram visualization
 */
export function visualizeHistogram(
  histogram: number[],
  width = 256,
  height = 150,
  peakPoint?: number,
  zeroPoint?: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  // Find the maximum value for scaling
  const maxValue = Math.max(...histogram)

  // Clear canvas
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Draw histogram bars
  ctx.fillStyle = "#333333"
  for (let i = 0; i < 256; i++) {
    const barHeight = (histogram[i] / maxValue) * height
    ctx.fillRect(i, height - barHeight, 1, barHeight)
  }

  // Highlight peak point if provided
  if (peakPoint !== undefined) {
    ctx.fillStyle = "#ff0000"
    const peakHeight = (histogram[peakPoint] / maxValue) * height
    ctx.fillRect(peakPoint, height - peakHeight, 1, peakHeight)
  }

  // Highlight zero point if provided
  if (zeroPoint !== undefined) {
    ctx.fillStyle = "#0000ff"
    const zeroHeight = (histogram[zeroPoint] / maxValue) * height
    ctx.fillRect(zeroPoint, height - zeroHeight, 1, zeroHeight)
  }

  return canvas
}

