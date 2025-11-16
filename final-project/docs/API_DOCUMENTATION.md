# API Documentation

This project uses Swagger/OpenAPI for API documentation.

## Accessing the Documentation

### Interactive Swagger UI

Visit `/api-docs` in your browser to view the interactive API documentation:

```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- Interactive API testing interface
- Request/response schemas
- Authentication information
- Example requests and responses

### Swagger JSON Specification

The OpenAPI JSON specification is available at:

```
http://localhost:3000/api/docs
```

This endpoint returns the raw OpenAPI 3.0 specification in JSON format, which can be used with other tools like Postman, Insomnia, or imported into API testing tools.

## Adding Documentation to New Endpoints

To add Swagger documentation to a new API endpoint, add JSDoc comments above your route handler function:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags:
 *       - YourTag
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 */
export async function GET() {
  // Your implementation
}
```

## Schema Definitions

Common schemas are defined in `lib/swagger.ts` under `components.schemas`. To add a new schema:

1. Add the schema definition to `lib/swagger.ts`
2. Reference it in your endpoint documentation using `$ref: '#/components/schemas/YourSchema'`

## Authentication

The API uses cookie-based authentication via NextAuth. The Swagger UI will automatically include the session cookie when making requests if you're logged in.

## Development

The Swagger documentation is automatically generated from JSDoc comments in your API route files. After adding or updating documentation:

1. Restart your development server
2. Refresh the `/api-docs` page
3. Your changes should be visible immediately

