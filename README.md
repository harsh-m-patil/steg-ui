# Steg-UI: Image Steganography Tool

## Overview

Steg-UI is a powerful image steganography tool that allows you to hide secret messages within digital images. This web-based application provides multiple steganography techniques, offering various trade-offs between capacity, security, and image quality preservation.

## What is Steganography?

Steganography is the practice of concealing information within non-secret data or a physical object to avoid detection. Unlike encryption, which makes data unreadable but obvious that a secret exists, steganography hides the very existence of the secret message.

## Features

- **Multiple Steganography Techniques**:
  - Least Significant Bit (LSB)
  - Improved LSB with variable bit positions
  - Patchwork algorithm
  - DCT (Discrete Cosine Transform)
  - Histogram Shifting

- **Easy-to-Use Interface**: Simple upload, encode, and decode functionality
- **Cross-Platform**: Works on any device with a modern web browser
- **Secure**: All processing happens locally in your browser

## How It Works

### Encoding Process

1. Upload an image file
2. Enter your secret message
3. Select a steganography technique
4. The tool encodes your message into the image
5. Download the resulting image, which looks visually identical to the original

### Decoding Process

1. Upload an image containing a hidden message
2. Select the same steganography technique used for encoding
3. The tool extracts and displays the hidden message

## Steganography Techniques Explained

### Least Significant Bit (LSB)

The most basic steganography technique. It works by replacing the least significant bit of each color channel (RGB) with bits from the secret message.

**How it works:**
- Each pixel in an image consists of three color values (Red, Green, Blue)
- Each color has 8 bits of data (values from 0-255)
- Changing just the last bit (LSB) causes minimal visual change
- The implementation loops through pixels and embeds 3 bits per pixel (1 in each channel)

**Advantages:**
- Simple implementation
- High capacity (can hide ~3 bits per pixel)

**Disadvantages:**
- Less resistant to image manipulation or compression

### Improved LSB

An enhancement of the basic LSB technique that uses variable bit positions for different color channels.

**How it works:**
- Uses 2nd LSB for Red channel
- Uses LSB for Green channel
- Uses 3rd LSB for Blue channel

**Advantages:**
- More difficult to detect than standard LSB
- Still offers good capacity

**Disadvantages:**
- Slight reduction in image quality compared to basic LSB

### Patchwork

A more sophisticated technique that modifies small patches of the image based on the message.

**How it works:**
- Divides the image into small patches (8x8 pixels)
- For each bit of the message, slightly increases or decreases the blue channel values in a patch
- Patch positions are determined algorithmically based on bit index

**Advantages:**
- More resistant to statistical analysis
- Better survivability against some image manipulations

**Disadvantages:**
- Lower capacity than LSB methods

### DCT (Discrete Cosine Transform)

A frequency-domain technique that embeds data in the coefficients of the Discrete Cosine Transform, similar to how JPEG compression works.

**How it works:**
- Divides the image into 8x8 pixel blocks
- Converts each block from spatial domain to frequency domain using DCT
- Embeds message bits by making specific frequency coefficients even or odd
- Converts back to spatial domain using inverse DCT

**Advantages:**
- Very resistant to visual detection
- Can survive some forms of lossy compression
- More secure than spatial domain techniques

**Disadvantages:**
- Lower capacity
- More computationally intensive

### Histogram Shifting

A technique that modifies the histogram of pixel values to embed data.

**How it works:**
- Analyzes the frequency distribution (histogram) of pixel values
- Identifies a peak point (most common value) and zero point (least common value)
- Shifts values between peak and zero to create space
- Embeds data bits by modifying pixels at the peak value

**Advantages:**
- Good resistance to statistical analysis
- Can provide good image quality

**Disadvantages:**
- Capacity depends heavily on the image characteristics
- Complex implementation

## Technical Implementation Details

The core functionality is implemented in TypeScript and operates entirely in the browser:

- Images are loaded into an HTML Canvas element for processing
- Messages are converted to binary strings
- The selected steganography algorithm is applied to modify pixel data
- For techniques like DCT, specialized mathematical transformations are applied
- The modified image is converted back to a downloadable format

### Dependencies

- TypeScript
- HTML Canvas API
- File API

## Security Considerations

While steganography can hide the existence of messages, this tool is primarily for educational purposes. Keep in mind:

- This implementation doesn't encrypt your message (though you could encrypt it before hiding)
- Some advanced steganalysis techniques might detect the presence of hidden data
- Different techniques have varying levels of resistance to image manipulation and compression

## Contributing

Feel free to contribute to this project by submitting issues or pull requests!

## License

[Include your license information here]

## Acknowledgements

This project was created as a team project for IS.
