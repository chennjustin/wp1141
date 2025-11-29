import { NextResponse } from "next/server";
import { listTagsAction } from "@/modules/tag/routes/list-tags";
import { createTagAction } from "@/modules/tag/routes/create-tag";
import { BadRequestError, InternalServerError } from "@/lib/errors";
import { handleServiceError, createErrorResponse } from "@/lib/api-response";
import type { CreateTagData, TagFilters } from "@/modules/tag/domain/tag.types";

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: List tags
 *     description: List tags with optional filter (system/user/all). System tags are automatically initialized if they don't exist.
 *     tags:
 *       - Tags
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *           enum: [system, user, all]
 *           default: all
 *         description: Filter tags by type - 'system' for system tags, 'user' for user-created tags, 'all' for all tags
 *     responses:
 *       200:
 *         description: List of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterParam = searchParams.get("filter");

    // Build filters object
    const filters: TagFilters = {};

    if (filterParam) {
      if (filterParam === "system" || filterParam === "user" || filterParam === "all") {
        filters.filter = filterParam;
      } else {
        return createErrorResponse(
          new BadRequestError("Invalid filter value. Must be 'system', 'user', or 'all'")
        );
      }
    }

    const result = await listTagsAction(filters);

    // Handle service errors
    const errorResponse = handleServiceError(result);
    if (errorResponse) {
      return errorResponse;
    }

    // Ensure data exists before returning
    if (!result.data) {
      return createErrorResponse(
        new InternalServerError("No data returned from service")
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tags] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     description: Create a new tag. Tag name must be unique. Users can only create their own tags.
 *     tags:
 *       - Tags
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagRequest'
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Bad request - Invalid input or name conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Tag name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return createErrorResponse(new BadRequestError("Invalid request body"));
    }

    // API accepts partial data, validation happens in service layer
    const tagData: Partial<CreateTagData> = body;

    // Validation is handled in service layer
    const result = await createTagAction(tagData as CreateTagData);

    // Handle service errors
    const errorResponse = handleServiceError(result);
    if (errorResponse) {
      return errorResponse;
    }

    // Ensure data exists before returning
    if (!result.data) {
      return createErrorResponse(
        new InternalServerError("No data returned from service")
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tags] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

