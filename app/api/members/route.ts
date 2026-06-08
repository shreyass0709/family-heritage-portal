import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { uploadImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const members = await prisma.familyMember.findMany({
      orderBy: {
        birthDate: "asc",
      },
    });

    const parsedMembers = members.map((member) => ({
      ...member,
      timeline: member.timeline ? JSON.parse(member.timeline) : [],
      achievements: member.achievements ? JSON.parse(member.achievements) : [],
    }));

    return NextResponse.json(parsedMembers);
  } catch (err) {
    console.error("Error fetching family members:", err);
    return NextResponse.json(
      { error: "Failed to fetch family members" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate request and check for ADMIN role
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse body fields
    const body = await req.json();
    const {
      name,
      gender,
      birthDate,
      deathDate,
      occupation,
      education,
      bio,
      photo,
      fatherId,
      motherId,
      spouseId,
      timeline,
      achievements,
    } = body;

    // 3. Validate mandatory parameters
    if (!name || !gender || !birthDate) {
      return NextResponse.json(
        { error: "Name, gender, and birth date are required fields" },
        { status: 400 }
      );
    }

    // Upload photo to UploadThing if base64 data is present
    let imageUrl = photo;
    if (photo && photo.startsWith("data:")) {
      try {
        const safeName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "member";
        imageUrl = await uploadImage(photo, `member_${safeName}`);
      } catch (err: any) {
        console.error("Failed to upload member photo:", err);
        return NextResponse.json(
          { error: `Photo upload failed: ${err.message || err}` },
          { status: 500 }
        );
      }
    }

    // 4. Create in DB
    const member = await prisma.familyMember.create({
      data: {
        name,
        gender,
        birthDate,
        deathDate: deathDate || null,
        occupation: occupation || null,
        education: education || null,
        bio: bio || null,
        photo: imageUrl || null,
        fatherId: fatherId || null,
        motherId: motherId || null,
        spouseId: spouseId || null,
        timeline: timeline ? JSON.stringify(timeline) : JSON.stringify([]),
        achievements: achievements ? JSON.stringify(achievements) : JSON.stringify([]),
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error("Error creating member in API:", err);
    return NextResponse.json(
      { error: "Failed to create family member" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // 1. Authenticate request and check for ADMIN role
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse body fields
    const body = await req.json();
    const {
      id,
      name,
      gender,
      birthDate,
      deathDate,
      occupation,
      education,
      bio,
      photo,
      fatherId,
      motherId,
      spouseId,
      timeline,
      achievements,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID is required for updating" }, { status: 400 });
    }

    if (!name || !gender || !birthDate) {
      return NextResponse.json(
        { error: "Name, gender, and birth date are required fields" },
        { status: 400 }
      );
    }

    // Upload photo to UploadThing if base64 data is present
    let imageUrl = photo;
    if (photo && photo.startsWith("data:")) {
      try {
        const safeName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "member";
        imageUrl = await uploadImage(photo, `member_${safeName}`);
      } catch (err: any) {
        console.error("Failed to upload member photo update:", err);
        return NextResponse.json(
          { error: `Photo upload failed: ${err.message || err}` },
          { status: 500 }
        );
      }
    }

    // 3. Update in DB
    const member = await prisma.familyMember.update({
      where: { id },
      data: {
        name,
        gender,
        birthDate,
        deathDate: deathDate || null,
        occupation: occupation || null,
        education: education || null,
        bio: bio || null,
        photo: imageUrl || null,
        fatherId: fatherId || null,
        motherId: motherId || null,
        spouseId: spouseId || null,
        timeline: timeline ? (typeof timeline === "string" ? timeline : JSON.stringify(timeline)) : undefined,
        achievements: achievements ? (typeof achievements === "string" ? achievements : JSON.stringify(achievements)) : undefined,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error("Error updating member in API:", err);
    return NextResponse.json(
      { error: "Failed to update family member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // 1. Authenticate request and check for ADMIN role
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Get ID from search params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Member ID is required for deletion" }, { status: 400 });
    }

    // 3. Delete in DB
    await prisma.familyMember.delete({
      where: { id },
    });

    // Clean up parent/mother/spouse links pointing to this member to avoid breaks in tree
    await prisma.$transaction([
      prisma.familyMember.updateMany({
        where: { fatherId: id },
        data: { fatherId: null }
      }),
      prisma.familyMember.updateMany({
        where: { motherId: id },
        data: { motherId: null }
      }),
      prisma.familyMember.updateMany({
        where: { spouseId: id },
        data: { spouseId: null }
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting member in API:", err);
    return NextResponse.json(
      { error: "Failed to delete family member" },
      { status: 500 }
    );
  }
}
