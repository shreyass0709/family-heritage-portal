import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Authenticate the request
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { file, filename, albumId, caption } = await req.json();

    if (!file) {
      return NextResponse.json({ error: "Missing image file data" }, { status: 400 });
    }

    // Upload image using utility helper (automatically falls back to local storage)
    const imageUrl = await uploadImage(file, filename);

    // If albumId is supplied, save to DB
    if (albumId) {
      const photo = await prisma.photo.create({
        data: {
          albumId,
          imageUrl,
          caption: caption || "",
        },
      });
      return NextResponse.json({ success: true, url: imageUrl, photo });
    }

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: "Image upload process failed" },
      { status: 500 }
    );
  }
}
