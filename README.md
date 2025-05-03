# Steg-UI

**Steg-UI** is a web-based steganography tool that allows users to hide and extract messages from images using four different algorithms: **LSB**, **Improved LSB**, **Patchwork Algorithm**, and **Histogram Shifting**. The app is built using **Next.js**, **Tailwind CSS**, and **TypeScript**, providing a clean and responsive user interface.

🌐 **Live Demo:** [steg-ui.vercel.app](https://steg-ui.vercel.app/)

---

## 🔧 Features

- 🖼️ Upload and preview images
- 🔐 Hide secret messages using:

  - **LSB (Least Significant Bit)**
  - **Improved LSB**
  - **Patchwork Algorithm**
  - **Histogram Shifting**

- 🔎 Extract hidden messages from stego-images
- 💡 Clean and modern UI with tab-based navigation

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** TypeScript
- **Package Manager:** pnpm

---

## 🗂️ Project Structure

```
.
├── app/                   # Next.js pages and layout
├── components/ui/         # Reusable UI components (button, input, card, etc.)
├── lib/                   # Core logic for steganography and utility functions
├── public/                # Static assets (icons, logos)
├── package.json           # Project metadata and dependencies
└── README.md              # You're reading it!
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)

### Installation

```bash
git clone https://github.com/your-username/steg-ui.git
cd steg-ui
pnpm install
pnpm dev
```

Visit `http://localhost:3000` in your browser.

---

## 📁 Algorithms Explained

- **LSB**: Embeds data in the least significant bits of image pixels.
- **Improved LSB**: A refined version of LSB that optimizes data embedding.
- **Patchwork**: Embeds data by modifying the pixel intensity difference between image regions.
- **Histogram Shifting**: Utilizes histogram peaks to shift and embed data with minimal distortion.
