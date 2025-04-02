export function applyDCT(block: number[][]): number[][] {
	const N = 8;
	const output = Array(N)
		.fill(0)
		.map(() => Array(N).fill(0));

	for (let u = 0; u < N; u++) {
		for (let v = 0; v < N; v++) {
			let sum = 0;

			for (let x = 0; x < N; x++) {
				for (let y = 0; y < N; y++) {
					sum +=
						block[x][y] *
						Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
						Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
				}
			}

			const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
			const cv = v === 0 ? 1 / Math.sqrt(2) : 1;

			output[u][v] = (1 / 4) * cu * cv * sum;
		}
	}

	return output;
}

/**
 * Applies inverse DCT to transform coefficients back to image data
 *
 * @param dctCoeffs - The DCT coefficients
 * @returns The reconstructed 8x8 block of image data
 */
export function applyInverseDCT(dctCoeffs: number[][]): number[][] {
	const N = 8;
	const output = Array(N)
		.fill(0)
		.map(() => Array(N).fill(0));

	for (let x = 0; x < N; x++) {
		for (let y = 0; y < N; y++) {
			let sum = 0;

			for (let u = 0; u < N; u++) {
				for (let v = 0; v < N; v++) {
					const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
					const cv = v === 0 ? 1 / Math.sqrt(2) : 1;

					sum +=
						cu *
						cv *
						dctCoeffs[u][v] *
						Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
						Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
				}
			}

			output[x][y] = (1 / 4) * sum;
		}
	}

	return output;
}

/**
 * Extracts an 8x8 block from image data at specified coordinates
 *
 * @param data - The image data array
 * @param width - The width of the image
 * @param x - The x coordinate of the top-left corner of the block
 * @param y - The y coordinate of the top-left corner of the block
 * @param channel - The color channel to extract (0 = R, 1 = G, 2 = B)
 * @returns An 8x8 block of pixel values
 */
export function extractBlock(
	data: Uint8ClampedArray,
	width: number,
	x: number,
	y: number,
	channel: number,
): number[][] {
	const block = Array(8)
		.fill(0)
		.map(() => Array(8).fill(0));

	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			const pixelIndex = ((y + i) * width + (x + j)) * 4;
			block[i][j] = data[pixelIndex + channel];
		}
	}

	return block;
}

/**
 * Writes an 8x8 block back to the image data
 *
 * @param data - The image data array
 * @param width - The width of the image
 * @param x - The x coordinate of the top-left corner of the block
 * @param y - The y coordinate of the top-left corner of the block
 * @param block - The 8x8 block of pixel values
 * @param channel - The color channel to write to (0 = R, 1 = G, 2 = B)
 */
export function writeBlock(
	data: Uint8ClampedArray,
	width: number,
	x: number,
	y: number,
	block: number[][],
	channel: number,
): void {
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			const pixelIndex = ((y + i) * width + (x + j)) * 4;
			// Clamp values to valid pixel range (0-255)
			data[pixelIndex + channel] = Math.max(
				0,
				Math.min(255, Math.round(block[i][j])),
			);
		}
	}
}
