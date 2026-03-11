import { NextResponse } from "next/server";
import { videoMap } from "@/vidlib/VideoMap";

export async function GET(
  req: Request,
  { params }: { params: { file: string } }
) {
  try {
    const fileName = params.file;

    const fileId = videoMap[fileName];

    if (!fileId) {
      return new NextResponse("Video not found", { status: 404 });
    }

    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const driveRes = await fetch(driveUrl);

    if (!driveRes.ok || !driveRes.body) {
      return new NextResponse("Failed to fetch video from Drive", { status: 500 });
    }

    return new NextResponse(driveRes.body, {
      headers: {
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
