import { applyDCT, applyInverseDCT, extractBlock, writeBlock } from "./dct";
/**
 * Image Steganography Library
 *
 * This library provides functions to encode and decode messages in images
 * using various steganography techniques.
 */

/**
 * Encodes a message into an image using the specified steganography technique
 *
 * @param image - The image file to encode the message into
 * @param message - The secret message to hide in the image
 * @param technique - The steganography technique to use
 * @returns A Promise that resolves to a data URL of the encoded image
 */
export async function encodeMessage(
	image: File,
	message: string,
	technique = "lsb",
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				try {
					const encodedDataUrl = processEncoding(img, message, technique);
					resolve(encodedDataUrl);
				} catch (error) {
					reject(error);
				}
			};
			img.onerror = () => reject(new Error("Failed to load image"));
			img.src = reader.result as string;
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(image);
	});
}

/**
 * Decodes a message from an image using the specified steganography technique
 *
 * @param image - The image file containing the hidden message
 * @param technique - The steganography technique used for encoding
 * @returns A Promise that resolves to the decoded message
 */
export async function decodeMessage(
	image: File,
	technique = "lsb",
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				try {
					const decodedMessage = processDecoding(img, technique);
					resolve(decodedMessage);
				} catch (error) {
					reject(error);
				}
			};
			img.onerror = () => reject(new Error("Failed to load image"));
			img.src = reader.result as string;
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(image);
	});
}

/**
 * Processes the encoding of a message into an image
 *
 * @param img - The Image object to encode the message into
 * @param message - The secret message to hide
 * @param technique - The steganography technique to use
 * @returns A data URL of the encoded image
 */
function processEncoding(
	img: HTMLImageElement,
	message: string,
	technique: string,
): string {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Could not create canvas context");
	}

	// Set canvas dimensions to match the image
	canvas.width = img.width;
	canvas.height = img.height;

	// Draw the original image onto the canvas
	ctx.drawImage(img, 0, 0);

	// Get the image data
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	// Prepare the message (add a terminator to know where the message ends)
	const messageWithTerminator = message + "§END§";

	// Convert the message to binary
	const binaryMessage = textToBinary(messageWithTerminator);

	// Check if the image is large enough to hold the message
	const maxBits = data.length * 0.75; // We can use 3 color channels (RGB) per pixel
	if (binaryMessage.length > maxBits) {
		throw new Error(
			`Message too large for this image. Maximum size: ${Math.floor(maxBits / 8)} bytes.`,
		);
	}

	// Apply the selected steganography technique
	switch (technique) {
		case "lsb":
			applyLSB(data, binaryMessage);
			break;
		case "lsb-improved":
			applyImprovedLSB(data, binaryMessage);
			break;
		case "patchwork":
			applyPatchwork(data, binaryMessage, canvas.width, canvas.height);
			break;
		case "dct":
			applyDCTSteganography(data, binaryMessage, canvas.width, canvas.height);
			break;
		case "histogram":
			applyHistogramShifting(data, binaryMessage);
			break;
		default:
			throw new Error(`Unknown technique: ${technique}`);
	}

	// Put the modified image data back on the canvas
	ctx.putImageData(imageData, 0, 0);

	// Convert the canvas to a data URL (PNG format to avoid lossy compression)
	return canvas.toDataURL("image/png");
}

/**
 * Processes the decoding of a message from an image
 *
 * @param img - The Image object containing the hidden message
 * @param technique - The steganography technique used for encoding
 * @returns The decoded message
 */
function processDecoding(img: HTMLImageElement, technique: string): string {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Could not create canvas context");
	}

	// Set canvas dimensions to match the image
	canvas.width = img.width;
	canvas.height = img.height;

	// Draw the image onto the canvas
	ctx.drawImage(img, 0, 0);

	// Get the image data
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	// Apply the selected steganography technique for decoding
	let binaryMessage: string;
	switch (technique) {
		case "lsb":
			binaryMessage = extractLSB(data);
			break;
		case "lsb-improved":
			binaryMessage = extractImprovedLSB(data);
			break;
		case "patchwork":
			binaryMessage = extractPatchwork(data, canvas.width, canvas.height);
			break;
		case "dct":
			binaryMessage = extractDCTSteganography(
				data,
				canvas.width,
				canvas.height,
			);
			break;
		case "histogram":
			binaryMessage = extractHistogramShifting(data);
			break;
		default:
			throw new Error(`Unknown technique: ${technique}`);
	}

	// Convert the binary message back to text
	const fullMessage = binaryToText(binaryMessage);

	// Extract the actual message by removing the terminator
	const terminatorIndex = fullMessage.indexOf("§END§");
	if (terminatorIndex === -1) {
		return fullMessage; // No terminator found, return the whole message
	}

	return fullMessage.substring(0, terminatorIndex);
}

/**
 * Converts text to a binary string
 *
 * @param text - The text to convert
 * @returns A binary string representation of the text
 */
function textToBinary(text: string): string {
	let binary = "";
	for (let i = 0; i < text.length; i++) {
		const charCode = text.charCodeAt(i);
		const bin = charCode.toString(2).padStart(8, "0");
		binary += bin;
	}
	return binary;
}

/**
 * Converts a binary string back to text
 *
 * @param binary - The binary string to convert
 * @returns The text representation of the binary string
 */
function binaryToText(binary: string): string {
	let text = "";
	for (let i = 0; i < binary.length; i += 8) {
		const byte = binary.substr(i, 8);
		if (byte.length < 8) break; // Incomplete byte, stop processing
		const charCode = Number.parseInt(byte, 2);
		text += String.fromCharCode(charCode);
	}
	return text;
}

/**
 * Applies the Least Significant Bit (LSB) technique to hide a message
 *
 * @param data - The image data array
 * @param binaryMessage - The binary message to hide
 */
function applyLSB(data: Uint8ClampedArray, binaryMessage: string): void {
	let bitIndex = 0;

	// Loop through pixels (RGBA values)
	for (let i = 0; i < data.length; i += 4) {
		// Only modify RGB channels (skip alpha)
		for (let j = 0; j < 3; j++) {
			if (bitIndex < binaryMessage.length) {
				// Clear the LSB and set it to the message bit
				data[i + j] =
					(data[i + j] & 0xfe) | Number.parseInt(binaryMessage[bitIndex]);
				bitIndex++;
			} else {
				return; // Message has been fully embedded
			}
		}
	}
}

/**
 * Extracts a message hidden using the LSB technique
 *
 * @param data - The image data array
 * @returns The binary message extracted from the image
 */
function extractLSB(data: Uint8ClampedArray): string {
	let binary = "";
	const maxBits = Math.min(data.length * 0.75, 100000); // Limit to prevent excessive processing

	// Loop through pixels (RGBA values)
	for (let i = 0; i < data.length && binary.length < maxBits; i += 4) {
		// Only read from RGB channels (skip alpha)
		for (let j = 0; j < 3 && binary.length < maxBits; j++) {
			// Extract the LSB
			binary += (data[i + j] & 0x01).toString();
		}
	}

	return binary;
}

/**
 * Applies an improved LSB technique that uses variable bit positions
 *
 * @param data - The image data array
 * @param binaryMessage - The binary message to hide
 */
function applyImprovedLSB(
	data: Uint8ClampedArray,
	binaryMessage: string,
): void {
	let bitIndex = 0;

	// Loop through pixels (RGBA values)
	for (let i = 0; i < data.length; i += 4) {
		// Use different bit positions for different color channels
		if (bitIndex < binaryMessage.length) {
			// Red channel - use 2nd LSB
			data[i] =
				(data[i] & 0xfd) | (Number.parseInt(binaryMessage[bitIndex]) << 1);
			bitIndex++;
		}

		if (bitIndex < binaryMessage.length) {
			// Green channel - use LSB
			data[i + 1] =
				(data[i + 1] & 0xfe) | Number.parseInt(binaryMessage[bitIndex]);
			bitIndex++;
		}

		if (bitIndex < binaryMessage.length) {
			// Blue channel - use 3rd LSB
			data[i + 2] =
				(data[i + 2] & 0xfb) | (Number.parseInt(binaryMessage[bitIndex]) << 2);
			bitIndex++;
		}

		if (bitIndex >= binaryMessage.length) {
			return; // Message has been fully embedded
		}
	}
}

/**
 * Extracts a message hidden using the improved LSB technique
 *
 * @param data - The image data array
 * @returns The binary message extracted from the image
 */
function extractImprovedLSB(data: Uint8ClampedArray): string {
	let binary = "";
	const maxBits = Math.min(data.length * 0.75, 100000); // Limit to prevent excessive processing

	// Loop through pixels (RGBA values)
	for (let i = 0; i < data.length && binary.length < maxBits; i += 4) {
		// Red channel - extract from 2nd LSB
		binary += ((data[i] & 0x02) >> 1).toString();

		if (binary.length < maxBits) {
			// Green channel - extract from LSB
			binary += (data[i + 1] & 0x01).toString();
		}

		if (binary.length < maxBits) {
			// Blue channel - extract from 3rd LSB
			binary += ((data[i + 2] & 0x04) >> 2).toString();
		}
	}

	return binary;
}

/**
 * Applies the Patchwork technique to hide a message
 *
 * @param data - The image data array
 * @param binaryMessage - The binary message to hide
 * @param width - The width of the image
 * @param height - The height of the image
 */
function applyPatchwork(
	data: Uint8ClampedArray,
	binaryMessage: string,
	width: number,
	height: number,
): void {
	let bitIndex = 0;
	const patchSize = 8; // Size of each patch

	// Loop through the message bits
	while (bitIndex < binaryMessage.length) {
		// Calculate patch position based on bit index
		const patchX = (bitIndex * 29) % (width - patchSize);
		const patchY = (bitIndex * 37) % (height - patchSize);

		// Get the current bit to embed
		const bit = Number.parseInt(binaryMessage[bitIndex]);

		// Apply the bit to the patch
		for (let y = 0; y < patchSize; y++) {
			for (let x = 0; x < patchSize; x++) {
				const pixelIndex = ((patchY + y) * width + (patchX + x)) * 4;

				// Modify the blue channel slightly based on the bit value
				if (bit === 1) {
					// Increase blue channel by 1 if not at max
					if (data[pixelIndex + 2] < 255) {
						data[pixelIndex + 2]++;
					}
				} else {
					// Decrease blue channel by 1 if not at min
					if (data[pixelIndex + 2] > 0) {
						data[pixelIndex + 2]--;
					}
				}
			}
		}

		bitIndex++;
	}
}

/**
 * Extracts a message hidden using the Patchwork technique
 *
 * @param data - The image data array
 * @param width - The width of the image
 * @param height - The height of the image
 * @returns The binary message extracted from the image
 */
function extractPatchwork(
	data: Uint8ClampedArray,
	width: number,
	height: number,
): string {
	let binary = "";
	const patchSize = 8; // Size of each patch
	const maxBits = 10000; // Limit to prevent excessive processing

	// Extract bits
	for (let bitIndex = 0; bitIndex < maxBits; bitIndex++) {
		// Calculate patch position based on bit index (same algorithm as encoding)
		const patchX = (bitIndex * 29) % (width - patchSize);
		const patchY = (bitIndex * 37) % (height - patchSize);

		// Calculate average blue value in the patch
		let blueSum = 0;
		let pixelCount = 0;

		for (let y = 0; y < patchSize; y++) {
			for (let x = 0; x < patchSize; x++) {
				const pixelIndex = ((patchY + y) * width + (patchX + x)) * 4;
				blueSum += data[pixelIndex + 2];
				pixelCount++;
			}
		}

		// Calculate average
		const blueAvg = blueSum / pixelCount;

		// Compare with surrounding area to determine bit value
		let surroundingBlueSum = 0;
		let surroundingPixelCount = 0;

		// Sample surrounding area (1 pixel border around the patch)
		for (let y = -1; y <= patchSize; y++) {
			for (let x = -1; x <= patchSize; x++) {
				// Skip the patch itself
				if (y >= 0 && y < patchSize && x >= 0 && x < patchSize) continue;

				// Check if the pixel is within image bounds
				if (
					patchY + y >= 0 &&
					patchY + y < height &&
					patchX + x >= 0 &&
					patchX + x < width
				) {
					const pixelIndex = ((patchY + y) * width + (patchX + x)) * 4;
					surroundingBlueSum += data[pixelIndex + 2];
					surroundingPixelCount++;
				}
			}
		}

		// Calculate surrounding average
		const surroundingBlueAvg =
			surroundingPixelCount > 0
				? surroundingBlueSum / surroundingPixelCount
				: blueAvg;

		// Determine bit value based on comparison
		binary += blueAvg > surroundingBlueAvg ? "1" : "0";

		// Check for terminator pattern every 8 bits
		if (binary.length % 8 === 0 && binary.length >= 40) {
			const text = binaryToText(binary);
			if (text.includes("§END§")) {
				return binary;
			}
		}
	}

	return binary;
}

// Fix the DCT steganography implementation
function applyDCTSteganography(
	data: Uint8ClampedArray,
	binaryMessage: string,
	width: number,
	height: number,
): void {
	let bitIndex = 0;
	const blockSize = 8;

	// Calculate how many complete 8x8 blocks we can fit
	const blocksX = Math.floor(width / blockSize);
	const blocksY = Math.floor(height / blockSize);

	// We'll use the blue channel for embedding (less noticeable to human eye)
	const channel = 2;

	// Store message length in the first block for extraction
	// Convert message length to 16-bit binary
	const messageLengthBinary = binaryMessage.length
		.toString(2)
		.padStart(16, "0");

	// Loop through blocks
	for (
		let blockY = 0;
		blockY < blocksY && bitIndex < binaryMessage.length;
		blockY++
	) {
		for (
			let blockX = 0;
			blockX < blocksX && bitIndex < binaryMessage.length;
			blockX++
		) {
			// Skip the first block - we'll use it to store metadata
			if (blockY === 0 && blockX === 0) {
				const metadataBlock = extractBlock(data, width, 0, 0, channel);

				// Store a signature and message length in this block
				// We'll modify the DC coefficient (0,0) to be even as a signature
				const dctCoeffs = applyDCT(metadataBlock);
				dctCoeffs[0][0] = Math.floor(dctCoeffs[0][0] / 2) * 2; // Make even

				// Store message length in positions (1,1) through (2,0)
				for (let i = 0; i < 16 && i < messageLengthBinary.length; i++) {
					const row = Math.floor(i / 4) + 1;
					const col = i % 4;

					if (messageLengthBinary[i] === "0") {
						dctCoeffs[row][col] = Math.floor(dctCoeffs[row][col] / 2) * 2; // Make even
					} else {
						dctCoeffs[row][col] = Math.floor(dctCoeffs[row][col] / 2) * 2 + 1; // Make odd
					}
				}

				// Apply inverse DCT and write back
				const modifiedBlock = applyInverseDCT(dctCoeffs);
				writeBlock(data, width, 0, 0, modifiedBlock, channel);
				continue;
			}

			// Extract 8x8 block
			const x = blockX * blockSize;
			const y = blockY * blockSize;
			const block = extractBlock(data, width, x, y, channel);

			// Apply DCT to the block
			const dctCoeffs = applyDCT(block);

			// Embed data in mid-frequency coefficients
			// We'll use positions (3,3), (3,4), (4,3), (4,4) for embedding
			// These are mid-frequency coefficients that don't affect visual quality much
			const embedPositions = [
				[3, 3],
				[3, 4],
				[4, 3],
				[4, 4],
			];

			for (
				let i = 0;
				i < embedPositions.length && bitIndex < binaryMessage.length;
				i++
			) {
				const [u, v] = embedPositions[i];
				const bit = Number.parseInt(binaryMessage[bitIndex]);

				// Quantize the coefficient to even/odd based on the bit
				// Use a larger quantization step for better robustness
				const quantStep = 8;
				const quantized = Math.round(dctCoeffs[u][v] / quantStep) * quantStep;

				if (bit === 0) {
					// Make coefficient even
					dctCoeffs[u][v] = quantized;
				} else {
					// Make coefficient odd
					dctCoeffs[u][v] = quantized + Math.floor(quantStep / 2);
				}

				bitIndex++;
			}

			// Apply inverse DCT
			const modifiedBlock = applyInverseDCT(dctCoeffs);

			// Write the block back to the image
			writeBlock(data, width, x, y, modifiedBlock, channel);
		}
	}
}

/**
 * Extracts a message hidden using DCT-based steganography
 *
 * @param data - The image data array
 * @param width - The width of the image
 * @param height - The height of the image
 * @returns The binary message extracted from the image
 */
function extractDCTSteganography(
	data: Uint8ClampedArray,
	width: number,
	height: number,
): string {
	let binary = "";
	const blockSize = 8;

	// Calculate how many complete 8x8 blocks we can fit
	const blocksX = Math.floor(width / blockSize);
	const blocksY = Math.floor(height / blockSize);

	// We used the blue channel for embedding
	const channel = 2;

	// First, extract metadata from the first block
	const metadataBlock = extractBlock(data, width, 0, 0, channel);
	const metadctCoeffs = applyDCT(metadataBlock);

	// Check signature (DC coefficient should be even)
	if (Math.round(metadctCoeffs[0][0]) % 2 !== 0) {
		throw new Error(
			"Invalid DCT signature. This image may not contain hidden data or was encoded with a different technique.",
		);
	}

	// Extract message length
	let messageLengthBinary = "";
	for (let i = 0; i < 16; i++) {
		const row = Math.floor(i / 4) + 1;
		const col = i % 4;

		messageLengthBinary +=
			Math.round(metadctCoeffs[row][col]) % 2 === 0 ? "0" : "1";
	}

	const messageLength = Number.parseInt(messageLengthBinary, 2);

	// The same embed positions we used for encoding
	const embedPositions = [
		[3, 3],
		[3, 4],
		[4, 3],
		[4, 4],
	];

	// Loop through blocks
	for (
		let blockY = 0;
		blockY < blocksY && binary.length < messageLength;
		blockY++
	) {
		for (
			let blockX = 0;
			blockX < blocksX && binary.length < messageLength;
			blockX++
		) {
			// Skip the first block - it contains metadata
			if (blockY === 0 && blockX === 0) {
				continue;
			}

			// Extract 8x8 block
			const x = blockX * blockSize;
			const y = blockY * blockSize;
			const block = extractBlock(data, width, x, y, channel);

			// Apply DCT to the block
			const dctCoeffs = applyDCT(block);

			// Extract bits from the coefficients
			for (
				let i = 0;
				i < embedPositions.length && binary.length < messageLength;
				i++
			) {
				const [u, v] = embedPositions[i];

				// Check if coefficient is even or odd
				const bit = Math.round(dctCoeffs[u][v]) % 2 === 0 ? "0" : "1";
				binary += bit;
			}
		}
	}

	return binary;
}

// Fix the Histogram Shifting implementation
function applyHistogramShifting(
	data: Uint8ClampedArray,
	binaryMessage: string,
): void {
	// We'll use the blue channel for embedding
	const channel = 2;

	// Step 1: Compute histogram
	const histogram = new Array(256).fill(0);

	// Skip the first 32 pixels (we'll use them for metadata)
	for (let i = 32 * 4; i < data.length; i += 4) {
		histogram[data[i + channel]]++;
	}

	// Step 2: Find peak point (most frequent value)
	let peakPoint = 0;
	let peakValue = 0;
	for (let i = 0; i < 256; i++) {
		if (histogram[i] > peakValue) {
			peakValue = histogram[i];
			peakPoint = i;
		}
	}

	// Step 3: Find zero point (least frequent non-zero value near peak)
	let zeroPoint = peakPoint > 127 ? peakPoint - 1 : peakPoint + 1;
	let minValue = histogram[zeroPoint];

	// Search for better zero point
	const searchRange = 20; // Look within this range of the peak
	const lowerBound = Math.max(1, peakPoint - searchRange);
	const upperBound = Math.min(254, peakPoint + searchRange);

	for (let i = lowerBound; i <= upperBound; i++) {
		if (i !== peakPoint && histogram[i] < minValue && histogram[i] > 0) {
			minValue = histogram[i];
			zeroPoint = i;
		}
	}

	// Step 4: Shift histogram to create space
	// If zero point is greater than peak point, shift right
	// If zero point is less than peak point, shift left
	const shiftRight = zeroPoint > peakPoint;

	// Skip the first 32 pixels (metadata area)
	for (let i = 32 * 4; i < data.length; i += 4) {
		const pixelValue = data[i + channel];

		if (shiftRight) {
			// Shift values between peak and zero to the right
			if (pixelValue > peakPoint && pixelValue < zeroPoint) {
				data[i + channel] = pixelValue + 1;
			}
		} else {
			// Shift values between zero and peak to the left
			if (pixelValue > zeroPoint && pixelValue < peakPoint) {
				data[i + channel] = pixelValue - 1;
			}
		}
	}

	// Step 5: Embed data
	let bitIndex = 0;

	// Skip the first 32 pixels (metadata area)
	for (
		let i = 32 * 4;
		i < data.length && bitIndex < binaryMessage.length;
		i += 4
	) {
		if (data[i + channel] === peakPoint) {
			const bit = Number.parseInt(binaryMessage[bitIndex]);

			// If bit is 1, shift the peak value
			if (bit === 1) {
				data[i + channel] = shiftRight ? peakPoint + 1 : peakPoint - 1;
			}

			bitIndex++;
		}
	}

	// Store metadata in the first 32 pixels
	// First 8 pixels: signature pattern [10, 20, 30, 40, 50, 60, 70, 80]
	for (let i = 0; i < 8; i++) {
		data[i * 4 + channel] = (i + 1) * 10;
	}

	// Next 2 pixels: peak point and zero point
	data[8 * 4 + channel] = peakPoint;
	data[9 * 4 + channel] = zeroPoint;

	// Next 2 pixels: shift direction and message length
	data[10 * 4 + channel] = shiftRight ? 1 : 0;
	data[11 * 4 + channel] = Math.min(255, binaryMessage.length / 8); // Store length in bytes (max 255)

	// If message is longer than 255 bytes, store the rest in the next pixel
	if (binaryMessage.length / 8 > 255) {
		data[12 * 4 + channel] = Math.floor(binaryMessage.length / 8 / 256);
	} else {
		data[12 * 4 + channel] = 0;
	}
}

/**
 * Extracts a message hidden using Histogram Shifting
 *
 * @param data - The image data array
 * @returns The binary message extracted from the image
 */
function extractHistogramShifting(data: Uint8ClampedArray): string {
	let binary = "";

	// We used the blue channel for embedding
	const channel = 2;

	// Check for signature pattern in first 8 pixels
	let isValidSignature = true;
	for (let i = 0; i < 8; i++) {
		if (data[i * 4 + channel] !== (i + 1) * 10) {
			isValidSignature = false;
			break;
		}
	}

	if (!isValidSignature) {
		throw new Error(
			"Invalid histogram shifting signature. This image may not contain hidden data or was encoded with a different technique.",
		);
	}

	// Extract metadata
	const peakPoint = data[8 * 4 + channel];
	//const zeroPoint = data[9 * 4 + channel]
	const shiftRight = data[10 * 4 + channel] === 1;

	// Get message length (in bytes)
	let messageLength = data[11 * 4 + channel] + data[12 * 4 + channel] * 256;
	messageLength *= 8; // Convert to bits

	// Extract bits
	// Start from pixel 32 to skip the metadata area
	for (
		let i = 32 * 4;
		i < data.length && binary.length < messageLength;
		i += 4
	) {
		const pixelValue = data[i + channel];

		if (pixelValue === peakPoint) {
			// If pixel value is at peak point, bit is 0
			binary += "0";
		} else if (
			(shiftRight && pixelValue === peakPoint + 1) ||
			(!shiftRight && pixelValue === peakPoint - 1)
		) {
			// If pixel value is at shifted peak point, bit is 1
			binary += "1";
		}
	}

	return binary.substring(0, messageLength);
}
