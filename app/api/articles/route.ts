import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  CreateArticleNewsSchema,
  UpdateArticleSchema,
} from "@/lib/validations/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { role: true },
  });

  if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) return null;
  return user;
}

function formatZodError(error: ZodError) {
  return error.issues.reduce(
    (acc, err) => {
      const field = err.path.join(".");
      acc[field] = err.message;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const publishedParam = searchParams.get("published");

    const published =
      publishedParam === null ? undefined : publishedParam === "true";

    if (id) {
      const article = await prisma.article.findFirst({
        where: {
          id: Number(id),
          deletedAt: null,
          ...(published !== undefined && { published }),
        },
      });

      if (!article) {
        return NextResponse.json(
          { message: "Article not found!" },
          { status: 404 },
        );
      }

      return NextResponse.json({ data: article });
    }

    if (slug) {
      const article = await prisma.article.findFirst({
        where: {
          slug,
          deletedAt: null,
          ...(published !== undefined && { published }),
        },
      });

      if (!article) {
        return NextResponse.json(
          { message: "Article not found!" },
          { status: 404 },
        );
      }

      return NextResponse.json({ data: article });
    }

    const article = await prisma.article.findMany({
      where: { deletedAt: null, ...(published !== undefined && { published }) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: article });
  } catch (err) {
    console.error("GET Article error:", err);
    return NextResponse.json(
      { message: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  try {
    const body: unknown = await req.json();
    const validated = CreateArticleNewsSchema.parse(body);
    const existing = await prisma.article.findUnique({
      where: { slug: validated.slug },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Slug already exists" },
        { status: 400 },
      );
    }

    const article = await prisma.article.create({
      data: {
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        coverImage: validated.coverImage ?? null,
        publicId: validated.publicId,
        type: validated.type,
        category: validated.category,
        published: validated.published,
        publishedAt: validated.published ? new Date() : null,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json(
      { message: "Article created:", data: article },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation Failed",
          errors: formatZodError(err),
        },
        { status: 422 },
      );
    }
    console.error("POST article error:", err);
    return NextResponse.json(
      { message: "Failed to create article" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Article ID is required." },
        { status: 400 },
      );
    }

    const body: unknown = await req.json();
    const validate = UpdateArticleSchema.parse(body);

    const article = await prisma.article.findFirst({
      where: { id: Number(id), deletedAt: null },
    });

    if (!article) {
      return NextResponse.json(
        { message: "Article not found!" },
        { status: 404 },
      );
    }

    if (validate.slug) {
      const slugUsed = await prisma.article.findFirst({
        where: { slug: validate.slug, NOT: { id: Number(id) } },
      });

      if (slugUsed) {
        return NextResponse.json(
          { message: "Slug already in use" },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title: validate.title,
        slug: validate.slug,
        content: validate.content,
        coverImage: validate.coverImage ?? null,
        publicId: validate.publicId,
        type: validate.type,
        category: validate.category,
        isActive: validate.isActive,
        published: validate.published,
        publishedAt:
          validate.published === true && !article.published
            ? new Date()
            : validate.published === false
              ? null
              : article.publishedAt,
      },
    });

    return NextResponse.json({ message: "Article update", data: updated });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation failed!", errors: formatZodError(err) },
        { status: 422 },
      );
    }
    console.error("PUT article error:", err);
    return NextResponse.json(
      { message: "Failed to update article" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Article ID is required." },
        { status: 400 },
      );
    }

    const article = await prisma.article.findFirst({
      where: { id: Number(id), deletedAt: null },
    });

    if (!article) {
      return NextResponse.json(
        { message: "Article not found!" },
        { status: 404 },
      );
    }

    await prisma.article.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return NextResponse.json({ message: "Article deleted." });
  } catch (err) {
    console.error("DELETE article error", err);
    return NextResponse.json(
      { message: "Failed to delete article" },
      { status: 500 },
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import {
//   CreateArticleNewsSchema,
//   UpdateArticleSchema,
// } from "@/lib/validations/auth";
// import { ZodError } from "zod";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);

//     const id = searchParams.get("id");
//     const slug = searchParams.get("slug");
//     const publishedParam = searchParams.get("published");

//     // normalize published param
//     const published =
//       publishedParam === null ? undefined : publishedParam === "true";

//     /* ======================
//        GET BY ID
//     ====================== */
//     if (id) {
//       const article = await prisma.article.findFirst({
//         where: {
//           id: Number(id),
//           deletedAt: null,
//           ...(published !== undefined && { published }),
//         },
//       });

//       if (!article) {
//         return NextResponse.json(
//           { message: "Article not found" },
//           { status: 404 },
//         );
//       }

//       return NextResponse.json({ data: article });
//     }

//     /* ======================
//        GET BY SLUG
//     ====================== */
//     if (slug) {
//       const article = await prisma.article.findFirst({
//         where: {
//           slug,
//           deletedAt: null,
//           ...(published !== undefined && { published }),
//         },
//       });

//       if (!article) {
//         return NextResponse.json(
//           { message: "Article not found" },
//           { status: 404 },
//         );
//       }

//       return NextResponse.json({ data: article });
//     }

//     /* ======================
//        GET ALL
//     ====================== */
//     const articles = await prisma.article.findMany({
//       where: {
//         deletedAt: null,
//         ...(published !== undefined && { published }),
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json({ data: articles });
//   } catch (error) {
//     console.error("GET articles error:", error);
//     return NextResponse.json(
//       { message: "Failed to fetch articles" },
//       { status: 500 },
//     );
//   }
// }

// /**
//  * POST
//  * - Create Article
//  */
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const {
//       title,
//       slug,
//       content,
//       coverImage,
//       publicId,
//       type,
//       category,
//       published,
//       isActive,
//     } = body;

//     if (!title || !slug || !type || !category) {
//       return NextResponse.json(
//         { message: "Title, slug, type and category are required" },
//         { status: 400 },
//       );
//     }

//     // slug unique
//     const existing = await prisma.article.findUnique({
//       where: { slug },
//     });

//     if (existing) {
//       return NextResponse.json(
//         { message: "Slug already exists" },
//         { status: 400 },
//       );
//     }

//     const article = await prisma.article.create({
//       data: {
//         title,
//         slug,
//         content,
//         coverImage,
//         publicId,
//         type,
//         category,
//         published: published ?? false,
//         publishedAt: published ? new Date() : null,
//         isActive: isActive ?? true,
//       },
//     });

//     return NextResponse.json(
//       { message: "Article created", data: article },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("POST article error:", error);
//     return NextResponse.json(
//       { message: "Failed to create article" },
//       { status: 500 },
//     );
//   }
// }

// /**
//  * PUT
//  * - Update Article
//  * - /api/articles?id=1
//  */
// export async function PUT(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         { message: "Article ID is required" },
//         { status: 400 },
//       );
//     }

//     const body = await req.json();
//     const {
//       title,
//       slug,
//       content,
//       coverImage,
//       publicId,
//       type,
//       category,
//       published,
//       isActive,
//     } = body;

//     const article = await prisma.article.findFirst({
//       where: {
//         id: Number(id),
//         deletedAt: null,
//       },
//     });

//     if (!article) {
//       return NextResponse.json(
//         { message: "Article not found" },
//         { status: 404 },
//       );
//     }

//     // slug unique (exclude self)
//     if (slug) {
//       const slugUsed = await prisma.article.findFirst({
//         where: {
//           slug,
//           NOT: { id: Number(id) },
//         },
//       });

//       if (slugUsed) {
//         return NextResponse.json(
//           { message: "Slug already in use" },
//           { status: 400 },
//         );
//       }
//     }

//     const updated = await prisma.article.update({
//       where: { id: Number(id) },
//       data: {
//         title,
//         slug,
//         content,
//         coverImage,
//         type,
//         category,
//         published,
//         publicId,
//         publishedAt:
//           published && !article.published
//             ? new Date()
//             : !published
//               ? null
//               : article.publishedAt,
//         isActive,
//       },
//     });

//     return NextResponse.json({
//       message: "Article updated",
//       data: updated,
//     });
//   } catch (error) {
//     console.error("PUT article error:", error);
//     return NextResponse.json(
//       { message: "Failed to update article" },
//       { status: 500 },
//     );
//   }
// }

// /**
//  * DELETE
//  * - Soft delete Article
//  * - /api/articles?id=1
//  */
// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         { message: "Article ID is required" },
//         { status: 400 },
//       );
//     }

//     const article = await prisma.article.findFirst({
//       where: {
//         id: Number(id),
//         deletedAt: null,
//       },
//     });

//     if (!article) {
//       return NextResponse.json(
//         { message: "Article not found" },
//         { status: 404 },
//       );
//     }

//     await prisma.article.update({
//       where: { id: Number(id) },
//       data: {
//         deletedAt: new Date(),
//         isActive: false,
//       },
//     });

//     return NextResponse.json({
//       message: "Article deleted",
//     });
//   } catch (error) {
//     console.error("DELETE article error:", error);
//     return NextResponse.json(
//       { message: "Failed to delete article" },
//       { status: 500 },
//     );
//   }
// }
