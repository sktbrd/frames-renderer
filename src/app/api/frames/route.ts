import { NextRequest, NextResponse } from "next/server";
import { parseFramesWithReports } from "frames.js/parseFramesWithReports";

// Function to validate specification
function isSpecificationValid(spec: string): boolean {
    return ["farcaster", "farcaster_v2"].includes(spec);
}

interface FrameData {
    image: string | null;
    title: string | null;
    buttons: { label: string; action: string }[];
    inputText: boolean;
    postUrl: string;
}

/** Proxies fetching a frame through a backend to avoid CORS issues and preserve user IP privacy */
export async function GET(request: NextRequest): Promise<Response> {
    const url = request.nextUrl.searchParams.get("url");
    const fid = request.nextUrl.searchParams.get("fid");
    const specification = request.nextUrl.searchParams.get("specification") ?? "farcaster_v2";

    if (!url) {
        return NextResponse.json({ message: "Missing URL parameter" }, { status: 400 });
    }

    if (!isSpecificationValid(specification)) {
        return NextResponse.json({ message: "Invalid specification" }, { status: 400 });
    }

    if (fid) {
        console.log(`Using FID ${fid} for frame authentication`);
    }

    try {
        const urlRes = await fetch(url);
        const html = await urlRes.text();

        const parseResult = await parseFramesWithReports({
            html,
            frameUrl: url,
            fallbackPostUrl: url,
            fromRequestMethod: "GET",
            parseSettings: {
                farcaster_v2: {
                    parseManifest: true,
                    strict: false,
                },
            },
        });

        // Extract frame data from the correct result property (farcaster_v2)
        const frameData: FrameData = extractFrameData(parseResult, url);

        console.log(`Frame parsed successfully:`, frameData);

        return NextResponse.json(frameData);
    } catch (err) {
        console.error('Error fetching frame:', err);

        if (err instanceof Error) {
            return NextResponse.json({ message: err.message }, { status: 500 });
        }

        return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
    }
}

/** Proxies frame actions to avoid CORS issues and preserve user IP privacy */
export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.json();
        const { frameUrl, buttonIndex, fid } = body;

        if (!frameUrl) {
            return NextResponse.json({ message: "Missing frameUrl in request body" }, { status: 400 });
        }

        console.log(`Processing button click for URL: ${frameUrl}, button: ${buttonIndex}`);

        // For now, just simulate a frame action by refetching the frame
        const urlRes = await fetch(frameUrl);
        const html = await urlRes.text();

        const parseResult = await parseFramesWithReports({
            html,
            frameUrl,
            fallbackPostUrl: frameUrl,
            fromRequestMethod: "POST",
            parseSettings: {
                farcaster_v2: {
                    parseManifest: true,
                    strict: false,
                },
            },
        });

        // Extract frame data using the same helper function
        const frameData: FrameData = extractFrameData(parseResult, frameUrl);

        return NextResponse.json(frameData);
    } catch (error) {
        console.error('Error processing frame action:', error);
        return NextResponse.json({
            message: error instanceof Error ? error.message : "An unknown error occurred"
        }, { status: 500 });
    }
}

/**
 * Helper function to extract frame data from parseFramesWithReports result
 */
function extractFrameData(parseResult: any, fallbackUrl: string): FrameData {
    // Initialize with default values
    const frameData: FrameData = {
        image: null,
        title: null,
        buttons: [],
        inputText: false,
        postUrl: fallbackUrl
    };

    try {
        // Try to get raw meta tags data first
        if (parseResult.raw?.flattenedMeta) {
            const meta = parseResult.raw.flattenedMeta;

            // Extract button data from meta tags
            const buttons: { label: string; action: string }[] = [];

            // Check for button labels (fc:frame:button:1, fc:frame:button:2, etc.)
            for (let i = 1; i <= 4; i++) {
                const buttonLabel = meta[`fc:frame:button:${i}`];
                if (buttonLabel) {
                    const buttonAction = meta[`fc:frame:button:${i}:action`] || 'post';
                    buttons.push({ label: buttonLabel, action: buttonAction });
                }
            }

            if (buttons.length > 0) {
                frameData.buttons = buttons;
            }

            // Get other metadata
            frameData.title = meta['fc:frame:title'] || meta['og:title'] || null;
            frameData.image = meta['fc:frame:image'] || meta['og:image'] || null;
            frameData.postUrl = meta['fc:frame:post_url'] || fallbackUrl;
            frameData.inputText = !!meta['fc:frame:input:text'];
        }
    } catch (e) {
        console.warn('Error extracting raw meta tags:', e);
    }

    // Try to get data from farcaster_v2 validated result if buttons are still empty
    if (frameData.buttons.length === 0) {
        // Try to get data from farcaster_v2 result first
        if (parseResult.farcaster_v2?.status === "success") {
            const frame = parseResult.farcaster_v2.frame;

            if (!frameData.image) {
                frameData.image = frame.image || null;
            }

            if (!frameData.title) {
                frameData.title = frame.title || null;
            }

            if (frame.buttons && frame.buttons.length > 0) {
                frameData.buttons = frame.buttons.map((btn: any) => ({
                    label: btn.label || 'Continue',
                    action: btn.action || 'post'
                }));
            }

            if (!frameData.inputText) {
                frameData.inputText = !!frame.input?.text;
            }

            if (frameData.postUrl === fallbackUrl) {
                frameData.postUrl = frame.postUrl || fallbackUrl;
            }

            return frameData;
        }

        // Fallback to older farcaster format if needed
        if (parseResult.farcaster?.status === "success") {
            const frame = parseResult.farcaster.frame;

            if (!frameData.image) {
                frameData.image = frame.image || null;
            }

            if (!frameData.title) {
                frameData.title = frame.title || null;
            }

            if (frame.buttons && frame.buttons.length > 0) {
                frameData.buttons = frame.buttons.map((btn: any) => ({
                    label: btn.label || 'Continue',
                    action: btn.action || 'post'
                }));
            }

            if (!frameData.inputText) {
                frameData.inputText = !!frame.inputText;
            }

            if (frameData.postUrl === fallbackUrl) {
                frameData.postUrl = frame.postUrl || fallbackUrl;
            }
        }
    }

    // If we still don't have buttons, add a default one
    if (frameData.buttons.length === 0) {
        // Check for appropriate default label based on content
        let defaultLabel = 'Continue';

        // Use more descriptive labels based on content type
        if (frameData.title?.toLowerCase().includes('read') ||
            fallbackUrl.includes('paragraph') ||
            fallbackUrl.includes('article')) {
            defaultLabel = 'Read';
        } else if (frameData.title?.toLowerCase().includes('watch') ||
            fallbackUrl.includes('video') ||
            fallbackUrl.includes('youtube')) {
            defaultLabel = 'Watch';
        } else if (fallbackUrl.includes('skatehive')) {
            defaultLabel = 'Be Brave';
        }

        frameData.buttons = [{ label: defaultLabel, action: 'post' }];
    }

    return frameData;
} 