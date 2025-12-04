import { NextResponse } from "next/server";
import { getTagAction } from "@/modules/tag/routes/get-tag";
import { updateTagAction } from "@/modules/tag/routes/update-tag";
import { deleteTagAction } from "@/modules/tag/routes/delete-tag";
import { BadRequestError, InternalServerError } from "@/lib/errors";
import { handleServiceError, createErrorResponse } from "@/lib/api-response";
import type { UpdateTagData } from "@/modules/tag/domain/tag.types";

interface RouteContext {
  params: {
    tagId: string;
  };
}

/**
 * @swagger
 * /api/tags/{tagId}:
 *   get:
 *     summary: Get tag by ID
 *     description: Get detailed information about a single tag
 *     tags:
 *       - Tags
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           example: "system-tag-food"
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tag not found
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
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { tagId } = context.params;
    const result = await getTagAction(tagId);

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
    console.error("[GET /api/tags/:tagId] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

/**
 * @swagger
 * /api/tags/{tagId}:
 *   patch:
 *     summary: Update tag
 *     description: Update tag information. Only the user who created the tag can update it. System tags cannot be updated.
 *     tags:
 *       - Tags
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           example: "system-tag-food"
 *         description: Tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTagRequest'
 *     responses:
 *       200:
 *         description: Tag updated successfully
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
 *       403:
 *         description: Forbidden - Cannot update system tag or tag created by another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tag not found
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
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { tagId } = context.params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return createErrorResponse(new BadRequestError("Invalid request body"));
    }

    // API accepts partial data, validation happens in service layer
    const updateData: Partial<UpdateTagData> = body;

    const result = await updateTagAction(tagId, updateData as UpdateTagData);

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
    console.error("[PATCH /api/tags/:tagId] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

/**
 * @swagger
 * /api/tags/{tagId}:
 *   delete:
 *     summary: Delete tag
 *     description: Soft delete a tag. Only the user who created the tag can delete it. System tags cannot be deleted.
 *     tags:
 *       - Tags
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           example: "system-tag-food"
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot delete system tag or tag created by another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tag not found
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
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { tagId } = context.params;
    const result = await deleteTagAction(tagId);

    // Handle service errors
    const errorResponse = handleServiceError(result);
    if (errorResponse) {
      return errorResponse;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/tags/:tagId] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

