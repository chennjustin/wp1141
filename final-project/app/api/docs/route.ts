/**
 * Swagger JSON endpoint
 * 
 * This route provides the Swagger/OpenAPI JSON specification
 * for API documentation.
 */

import { getSwaggerSpec } from "@/lib/swagger";
import { NextResponse } from "next/server";

// Use Node.js runtime for consistency with other API routes
export const runtime = "nodejs";

export async function GET() {
  const swaggerSpec = getSwaggerSpec();
  return NextResponse.json(swaggerSpec);
}

