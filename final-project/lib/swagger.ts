/**
 * Swagger configuration
 * 
 * This module configures Swagger/OpenAPI documentation for the API.
 */

import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Coin Undergraduate API",
    version: "1.0.0",
    description:
      "API documentation for Coin Undergraduate - A wallet and transaction management system",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "next-auth.session-token",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
          },
        },
        required: ["error"],
      },
      Wallet: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Wallet ID",
          },
          name: {
            type: "string",
            description: "Wallet name",
          },
          defaultCurrency: {
            type: "string",
            description: "Default currency code (e.g., TWD)",
            default: "TWD",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
          },
          isDeleted: {
            type: "boolean",
            description: "Soft delete flag",
          },
          members: {
            type: "array",
            items: {
              $ref: "#/components/schemas/WalletMember",
            },
          },
        },
        required: ["id", "name", "defaultCurrency", "createdAt", "updatedAt", "isDeleted"],
      },
      WalletMember: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          userId: {
            type: "string",
          },
          role: {
            type: "string",
            enum: ["OWNER", "MEMBER", "VIEWER"],
          },
          user: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
              email: {
                type: "string",
                nullable: true,
              },
              image: {
                type: "string",
                nullable: true,
              },
            },
          },
        },
      },
      CreateWalletRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Wallet name",
            example: "My Wallet",
          },
          defaultCurrency: {
            type: "string",
            description: "Default currency code",
            example: "TWD",
            default: "TWD",
          },
          setAsDefault: {
            type: "boolean",
            description: "Set as user's default wallet",
            default: false,
          },
        },
        required: ["name"],
      },
      UpdateWalletRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Wallet name",
            example: "Updated Wallet Name",
          },
          defaultCurrency: {
            type: "string",
            description: "Default currency code",
            example: "USD",
          },
        },
      },
      WalletDeleteResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
        },
        required: ["success"],
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    "./app/api/**/*.ts",
    "./app/api/**/*.tsx",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

