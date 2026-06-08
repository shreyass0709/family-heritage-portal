import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        photos: {
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { title: "asc" }
    });
    return NextResponse.json(albums);
  } catch (err) {
    console.error("Error fetching albums:", err);
    return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { title, category, familyGroup } = await req.json();

    if (!title || !category) {
      return NextResponse.json({ error: "Title and Category are required" }, { status: 400 });
    }

    const album = await prisma.album.create({
      data: {
        title,
        category,
        familyGroup: familyGroup || "Full Family",
      }
    });

    return NextResponse.json({ success: true, album });
  } catch (err) {
    console.error("Error creating album:", err);
    return NextResponse.json({ error: "Failed to create album" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // 1. Authenticate request and check for ADMIN role
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Get search params
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get("albumId");
    const photoId = searchParams.get("photoId");

    if (!albumId && !photoId) {
      return NextResponse.json({ error: "albumId or photoId is required" }, { status: 400 });
    }

    if (albumId) {
      await prisma.album.delete({
        where: { id: albumId },
      });
      return NextResponse.json({ success: true, message: "Album and all its photos deleted" });
    }

    if (photoId) {
      await prisma.photo.delete({
        where: { id: photoId },
      });
      return NextResponse.json({ success: true, message: "Photo deleted" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("Error deleting item from gallery:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
