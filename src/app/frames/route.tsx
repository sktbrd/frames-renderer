import { NextRequest, NextResponse } from "next/server";

// Helper function to parse and extract frame metadata
async function parseFrame(url: string) {
    try {
        // Fetch the HTML of the target URL
        const response = await fetch(url, {
            headers: {
                // Add user-agent to avoid being blocked by some servers
                "User-Agent": "Mozilla/5.0 (compatible; FrameViewer/1.0)"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();

        // Extract frame metadata using regex for various possible meta tags
        const imageMatch =
            html.match(/<meta\s+property="fc:frame:image"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i) ||
            html.match(/<meta\s+property="og:image"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i);

        const titleMatch =
            html.match(/<meta\s+property="fc:frame:title"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i) ||
            html.match(/<meta\s+property="og:title"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i) ||
            html.match(/<title>([^<]+)<\/title>/i);

        const buttonsMatch = Array.from(
            html.matchAll(/<meta\s+property="fc:frame:button:(\d+)"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/ig)
        );

        const inputTextMatch = html.match(/<meta\s+property="fc:frame:input:text"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i);

        // Look for post URL
        const postUrlMatch = html.match(/<meta\s+property="fc:frame:post_url"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i);

        // Parse buttons into an array of objects
        const buttons = buttonsMatch.map(match => {
            const index = parseInt(match[1]);
            const label = match[2] || match[3] || "Button";
            return { index, label, action: "post" };
        }).sort((a, b) => a.index - b.index);

        // Extract the image URL
        let imageUrl = null;
        if (imageMatch) {
            imageUrl = imageMatch[1] || imageMatch[2];

            // Handle relative URLs
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                const urlObj = new URL(url);
                if (imageUrl.startsWith('/')) {
                    imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
                } else {
                    // Handle relative path without leading slash
                    const path = urlObj.pathname.split('/').slice(0, -1).join('/');
                    imageUrl = `${urlObj.protocol}//${urlObj.host}${path}/${imageUrl}`;
                }
            }
        }

        // Extract the title
        const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : null;

        // Extract post URL (for action handling)
        const postUrl = postUrlMatch ? (postUrlMatch[1] || postUrlMatch[2]) : url;

        return {
            image: imageUrl,
            title: title,
            buttons: buttons.length > 0
                ? buttons.map(b => ({ label: b.label, action: b.action }))
                : [{ label: "Continue", action: "post" }], // Default button if none found
            inputText: !!inputTextMatch,
            postUrl,
        };
    } catch (error) {
        console.error("Error parsing frame:", error);
        throw new Error("Failed to parse frame");
    }
}

// GET handler for fetching frame metadata
export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl.searchParams.get("url");
        const fid = request.nextUrl.searchParams.get("fid");

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        if (!url.startsWith('http')) {
            return NextResponse.json({ error: "Invalid URL. Must start with http:// or https://" }, { status: 400 });
        }

        const frameData = await parseFrame(url);

        console.log("Frame parsed successfully:", frameData);

        // Add authentication context to the response
        if (fid) {
            const fidNumber = parseInt(fid);
            if (!isNaN(fidNumber)) {
                console.log(`Using FID ${fidNumber} for frame authentication`);
            }
        }

        return NextResponse.json(frameData);
    } catch (error) {
        console.error("Error handling frame GET request:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// POST handler for handling frame button actions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { frameUrl, buttonIndex, inputText, fid } = body;

        if (!frameUrl) {
            return NextResponse.json({ error: "No frameUrl provided" }, { status: 400 });
        }

        if (!buttonIndex) {
            return NextResponse.json({ error: "No buttonIndex provided" }, { status: 400 });
        }

        if (!frameUrl.startsWith('http')) {
            return NextResponse.json({ error: "Invalid URL. Must start with http:// or https://" }, { status: 400 });
        }

        console.log(`Processing button click for URL: ${frameUrl}, button: ${buttonIndex}`);

        // Parse the frame metadata first
        const frameData = await parseFrame(frameUrl);

        // For simplicity in this demo, just return to the original frame URL
        // This simulates the action of navigating to the first frame in a sequence
        return NextResponse.json(frameData);
    } catch (error) {
        console.error("Error handling frame POST request:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
} 