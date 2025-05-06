# Farcaster Frame Viewer

A simple application that allows you to view and interact with Farcaster Frames. This app provides a user-friendly interface where you can input any Frame URL and render it in your browser.

## Features

- Enter any Farcaster Frame URL to view it
- Interact with Frame buttons
- Input text when the frame requires it
- Responsive design that works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/my-farcaster-app.git
cd my-farcaster-app
```

2. Install dependencies
```
npm install
```

3. Run the development server
```
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## How to Use

1. Enter a valid Farcaster Frame URL in the input field
2. Click the "Load Frame" button
3. Interact with the frame using the provided buttons
4. Enter text if prompted by the frame

## Example Frame URLs

You can try these example Farcaster Frames:

- Onchain Summer: https://frame.onchnsummer.xyz
- Word Game: https://frames-word-game.vercel.app
- Frames.js Examples: https://framesjs.org

## Technical Implementation

This application is built with:

- Next.js (App Router)
- TypeScript
- Tailwind CSS

The app implements a simplified version of the Farcaster Frames protocol:

1. A client-side component fetches and renders frame data
2. Server-side route handlers process frame GET and POST requests
3. Simple frame metadata parsing extracts images, buttons, and input fields

## Limitations

This is a simplified viewer that doesn't implement the full Farcaster Frame protocol:

- No wallet/signer integration for authenticated actions
- No proper frame message signing
- Limited parsing of frame metadata
- No support for frame transactions

For a more complete implementation, check out the [Frames.js](https://framesjs.org) library.

## License

MIT
