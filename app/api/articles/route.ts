import { ArticleStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  CreateArticleNewsSchema,
  UpdateArticleSchema,
} from "@/lib/validations/auth";

async function checkAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    select: {
      role: true,
    },
  });

  if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) {
    return null;
  }

  return user;
}

function formatZodError(error: ZodError) {
  return error.issues.reduce(
    (acc, issue) => {
      const field = issue.path.join(".");
      acc[field] = issue.message;

      return acc;
    },
    {} as Record<string, string>,
  );
}

function parseArticleStatus(
  value: string | null,
): ArticleStatus | undefined {
  if (!value) {
    return undefined;
  }

  if (
    Object.values(ArticleStatus).includes(
      value as ArticleStatus,
    )
  ) {
    return value as ArticleStatus;
  }

  return undefined;
}

/*
 * =========================================================
 * GET
 * =========================================================
 *
 * Examples:
 *
 * GET /api/articles
 * GET /api/articles?id=1
 * GET /api/articles?slug=my-article
 * GET /api/articles?status=PUBLISHED
 *
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const status = parseArticleStatus(
      searchParams.get("status"),
    );

    /*
     * =====================================================
     * GET BY ID
     * =====================================================
     */
    if (id) {
      const articleId = Number(id);

      if (Number.isNaN(articleId)) {
        return NextResponse.json(
          {
            message: "Invalid article ID.",
          },
          {
            status: 400,
          },
        );
      }

      const article = await prisma.article.findFirst({
        where: {
          id: articleId,
          deletedAt: null,
          ...(status !== undefined && {
            status,
          }),
        },
      });

      if (!article) {
        return NextResponse.json(
          {
            message: "Article not found!",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        data: article,
      });
    }

    /*
     * =====================================================
     * GET BY SLUG
     * =====================================================
     */
    if (slug) {
      const article = await prisma.article.findFirst({
        where: {
          slug,
          deletedAt: null,
          ...(status !== undefined && {
            status,
          }),
        },
      });

      if (!article) {
        return NextResponse.json(
          {
            message: "Article not found!",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        data: article,
      });
    }

    /*
     * =====================================================
     * GET ALL
     * =====================================================
     */
    const articles = await prisma.article.findMany({
      where: {
        deletedAt: null,
        ...(status !== undefined && {
          status,
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: articles,
    });
  } catch (error) {
    console.error("GET Article error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch articles",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =========================================================
 * POST
 * =========================================================
 */
export async function POST(req: NextRequest) {
  const admin = await checkAdmin();

  if (!admin) {
    return NextResponse.json(
      {
        message: "Forbidden!",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const body: unknown = await req.json();

    const validated =
      CreateArticleNewsSchema.parse(body);

    /*
     * =====================================================
     * CHECK DUPLICATE SLUG
     * =====================================================
     */
    const existing = await prisma.article.findUnique({
      where: {
        slug: validated.slug,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Slug already exists",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * CREATE ARTICLE
     * =====================================================
     */
    const article = await prisma.article.create({
      data: {
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        coverImage: validated.coverImage ?? null,
        publicId: validated.publicId,
        type: validated.type,
        category: validated.category,

        /*
         * OLD:
         * published: validated.published
         *
         * NEW:
         */
        status: validated.status,

        publishedAt:
          validated.status === ArticleStatus.PUBLISHED
            ? new Date()
            : null,

        isActive: validated.isActive,
      },
    });

    return NextResponse.json(
      {
        message: "Article created",
        data: article,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation Failed",
          errors: formatZodError(error),
        },
        {
          status: 422,
        },
      );
    }

    console.error("POST article error:", error);

    return NextResponse.json(
      {
        message: "Failed to create article",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =========================================================
 * PUT
 * =========================================================
 */
export async function PUT(req: NextRequest) {
  const admin = await checkAdmin();

  if (!admin) {
    return NextResponse.json(
      {
        message: "Forbidden!",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message: "Article ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const articleId = Number(id);

    if (Number.isNaN(articleId)) {
      return NextResponse.json(
        {
          message: "Invalid article ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body: unknown = await req.json();

    const validated =
      UpdateArticleSchema.parse(body);

    /*
     * =====================================================
     * CHECK ARTICLE
     * =====================================================
     */
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        deletedAt: null,
      },
    });

    if (!article) {
      return NextResponse.json(
        {
          message: "Article not found!",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =====================================================
     * CHECK SLUG
     * =====================================================
     */
    if (validated.slug) {
      const slugUsed = await prisma.article.findFirst({
        where: {
          slug: validated.slug,
          NOT: {
            id: articleId,
          },
        },
      });

      if (slugUsed) {
        return NextResponse.json(
          {
            message: "Slug already in use",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
     * =====================================================
     * PUBLISHED DATE LOGIC
     * =====================================================
     *
     * DRAFT -> PUBLISHED
     *     publishedAt = now
     *
     * PUBLISHED -> PUBLISHED
     *     keep existing publishedAt
     *
     * PUBLISHED -> DRAFT
     *     publishedAt = null
     *
     * PUBLISHED -> ARCHIVED
     *     publishedAt = null
     *
     * ARCHIVED -> PUBLISHED
     *     publishedAt = now
     *
     */
    let publishedAt = article.publishedAt;

    if (
      validated.status === ArticleStatus.PUBLISHED &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      publishedAt = new Date();
    }

    if (
      validated.status !== ArticleStatus.PUBLISHED
    ) {
      publishedAt = null;
    }

    /*
     * =====================================================
     * UPDATE
     * =====================================================
     */
    const updated = await prisma.article.update({
      where: {
        id: articleId,
      },
      data: {
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        coverImage: validated.coverImage ?? null,
        publicId: validated.publicId,
        type: validated.type,
        category: validated.category,
        status: validated.status,
        publishedAt,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json({
      message: "Article updated",
      data: updated,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed!",
          errors: formatZodError(error),
        },
        {
          status: 422,
        },
      );
    }

    console.error("PUT article error:", error);

    return NextResponse.json(
      {
        message: "Failed to update article",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =========================================================
 * DELETE
 * =========================================================
 *
 * Soft delete.
 *
 */
export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin();

  if (!admin) {
    return NextResponse.json(
      {
        message: "Forbidden!",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message: "Article ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const articleId = Number(id);

    if (Number.isNaN(articleId)) {
      return NextResponse.json(
        {
          message: "Invalid article ID.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * CHECK ARTICLE
     * =====================================================
     */
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        deletedAt: null,
      },
    });

    if (!article) {
      return NextResponse.json(
        {
          message: "Article not found!",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =====================================================
     * SOFT DELETE
     * =====================================================
     */
    await prisma.article.update({
      where: {
        id: articleId,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
        status: ArticleStatus.ARCHIVED,
      },
    });

    return NextResponse.json({
      message: "Article deleted.",
    });
  } catch (error) {
    console.error("DELETE article error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete article",
      },
      {
        status: 500,
      },
    );
  }
}