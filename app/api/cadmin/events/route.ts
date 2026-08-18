import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

/* =========================
   GET - list / detail
========================= */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        // DETAIL
        if (id) {
            const event = await prisma.event.findFirst({
                where: {
                    id: Number(id),
                    deletedAt: null,
                },
                include: {
                    category: true,
                    company: true,
                },
            });

            if (!event) {
                return NextResponse.json(
                    { success: false, message: "Event not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: event,
            });
        }

        // LIST
        const events = await prisma.event.findMany({
            where: { deletedAt: null },
            include: {
                category: true,
                company: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            success: true,
            data: events,
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to fetch events" },
            { status: 500 }
        );
    }
}

/* =========================
   POST - create
========================= */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const event = await prisma.event.create({
            data: {
                title: body.title,
                slug: slugify(body.title, { lower: true }),
                description: body.description,
                location: body.location,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                price: Number(body.price),
                quota: body.quota ? Number(body.quota) : null,
                categoryId: Number(body.categoryId),
                companyId: Number(body.companyId),
                isPublished: Boolean(body.isPublished),
                coverImage: body.coverImage,
                publicId: body.publicId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Event created successfully",
            data: event,
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to create event" },
            { status: 500 }
        );
    }
}

/* =========================
   PUT - update
========================= */
export async function PUT(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { message: "Event ID is required" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const slug = body.slug;
        // slug unique check (exclude self)
        if (slug) {
            const slugUsed = await prisma.event.findFirst({
                where: {
                    slug,
                    NOT: { id: Number(id) },
                },
            });

            if (slugUsed) {
                return NextResponse.json(
                    { message: "Slug already in use" },
                    { status: 400 }
                );
            }
        }

        const event = await prisma.event.update({
            where: { id: Number(id) },
            data: {
                title: body.title,
                slug,
                description: body.description,
                location: body.location,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                price: Number(body.price),
                quota: body.quota ? Number(body.quota) : null,
                categoryId: Number(body.categoryId),
                companyId: Number(body.companyId),
                isPublished: Boolean(body.isPublished),
                coverImage: body.coverImage,
                publicId: body.publicId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Event updated successfully",
            data: event,
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to update event" },
            { status: 500 }
        );
    }
}

/* =========================
   DELETE - soft delete
========================= */
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Event id is required" },
                { status: 400 }
            );
        }

        await prisma.event.update({
            where: { id: Number(id) },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to delete event" },
            { status: 500 }
        );
    }
}
