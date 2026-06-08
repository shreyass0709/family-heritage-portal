import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chapters = await prisma.storyChapter.findMany({
      orderBy: {
        chapter: "asc",
      },
    });
    return NextResponse.json(chapters);
  } catch (err) {
    console.error("Error fetching chapters:", err);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { chapter, title, content } = body;

    if (chapter === undefined || !title || !content) {
      return NextResponse.json(
        { error: "Chapter number, title, and content are required fields" },
        { status: 400 }
      );
    }

    const parsedChapter = parseInt(chapter);
    if (isNaN(parsedChapter)) {
      return NextResponse.json(
        { error: "Chapter number must be a valid integer" },
        { status: 400 }
      );
    }

    // Check if chapter number is unique
    const existing = await prisma.storyChapter.findUnique({
      where: { chapter: parsedChapter },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Chapter number ${chapter} already exists. Please choose a unique chapter number.` },
        { status: 400 }
      );
    }

    const dbChapter = await prisma.storyChapter.create({
      data: {
        chapter: parsedChapter,
        title,
        content,
      },
    });

    return NextResponse.json({ success: true, chapter: dbChapter });
  } catch (err) {
    console.error("Error creating chapter:", err);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { id, chapter, title, content } = body;

    if (!id || chapter === undefined || !title || !content) {
      return NextResponse.json(
        { error: "ID, chapter number, title, and content are required fields" },
        { status: 400 }
      );
    }

    const parsedChapter = parseInt(chapter);
    if (isNaN(parsedChapter)) {
      return NextResponse.json(
        { error: "Chapter number must be a valid integer" },
        { status: 400 }
      );
    }

    // Check if chapter number is unique (excluding the current one)
    const existing = await prisma.storyChapter.findFirst({
      where: {
        chapter: parsedChapter,
        NOT: { id },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Chapter number ${chapter} already exists. Please choose a unique chapter number.` },
        { status: 400 }
      );
    }

    const dbChapter = await prisma.storyChapter.update({
      where: { id },
      data: {
        chapter: parsedChapter,
        title,
        content,
      },
    });

    return NextResponse.json({ success: true, chapter: dbChapter });
  } catch (err) {
    console.error("Error updating chapter:", err);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Chapter ID is required for deletion" }, { status: 400 });
    }

    await prisma.storyChapter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting chapter:", err);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
