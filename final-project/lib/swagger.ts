/**
 * Swagger configuration
 * 
 * This module configures Swagger/OpenAPI documentation for the API.
 */

import swaggerJsdoc from "swagger-jsdoc";
import { config } from "@/config/env";

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
      url: config.nextAuthUrl ?? "http://localhost:3000",
      description: config.isProduction ? "Production server" : "Development server",
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
      Transaction: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Transaction ID",
          },
          walletId: {
            type: "string",
            description: "Wallet ID",
          },
          createdById: {
            type: "string",
            description: "User ID who created the transaction",
          },
          date: {
            type: "string",
            format: "date-time",
            description: "Transaction date",
          },
          amount: {
            type: "number",
            description: "Transaction amount",
          },
          currency: {
            type: "string",
            description: "Currency code (e.g., TWD, USD)",
          },
          rateToNTD: {
            type: "number",
            nullable: true,
            description: "Exchange rate to NTD",
          },
          name: {
            type: "string",
            nullable: true,
            description: "Transaction name/description",
          },
          note: {
            type: "string",
            nullable: true,
            description: "Transaction note",
          },
          isDeleted: {
            type: "boolean",
            description: "Soft delete flag",
          },
          type: {
            type: "string",
            enum: ["INCOME", "EXPENSE"],
            description: "Transaction type - INCOME for income, EXPENSE for expense",
            default: "EXPENSE",
          },
          tagId: {
            type: "string",
            nullable: true,
            description: "Tag ID",
          },
          tag: {
            type: "object",
            nullable: true,
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
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
          payers: {
            type: "array",
            items: {
              $ref: "#/components/schemas/TransactionPayer",
            },
            description: "Transaction payers",
          },
          shares: {
            type: "array",
            items: {
              $ref: "#/components/schemas/TransactionShare",
            },
            description: "Transaction shares",
          },
          createdBy: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
          },
        },
        required: [
          "id",
          "walletId",
          "createdById",
          "date",
          "amount",
          "currency",
          "isDeleted",
          "type",
          "createdAt",
          "updatedAt",
        ],
      },
      TransactionPayer: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          transactionId: {
            type: "string",
          },
          payerId: {
            type: "string",
          },
          paidAmount: {
            type: "number",
          },
          payer: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
              image: {
                type: "string",
                nullable: true,
              },
            },
          },
        },
      },
      TransactionShare: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          transactionId: {
            type: "string",
          },
          userId: {
            type: "string",
          },
          shareAmount: {
            type: "number",
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
              image: {
                type: "string",
                nullable: true,
              },
            },
          },
        },
      },
      CreateTransactionRequest: {
        type: "object",
        properties: {
          walletId: {
            type: "string",
            description: "Wallet ID",
            example: "clx1234567890",
          },
          date: {
            type: "string",
            format: "date-time",
            description: "Transaction date (ISO 8601)",
            example: "2024-01-15T10:30:00Z",
          },
          amount: {
            type: "number",
            description: "Transaction amount",
            example: 1000.5,
          },
          currency: {
            type: "string",
            description: "Currency code (defaults to last transaction's currency or wallet's default)",
            example: "TWD",
          },
          rateToNTD: {
            type: "number",
            nullable: true,
            description: "Exchange rate to NTD (defaults to last used rate for currency)",
            example: 1.0,
          },
          name: {
            type: "string",
            nullable: true,
            description: "Transaction name/description",
            example: "Lunch",
          },
          note: {
            type: "string",
            nullable: true,
            description: "Transaction note",
            example: "Team lunch at restaurant",
          },
          type: {
            type: "string",
            enum: ["INCOME", "EXPENSE"],
            description: "Transaction type - INCOME for income, EXPENSE for expense (defaults to EXPENSE)",
            example: "EXPENSE",
          },
          tagId: {
            type: "string",
            description: "Tag ID (required, must exist in database)",
            example: "clx1234567890",
          },
          payers: {
            type: "array",
            description: "Transaction payers (for v2.0 - defaults to creator if not provided). Total paidAmount must equal transaction amount.",
            items: {
              type: "object",
              properties: {
                payerId: {
                  type: "string",
                  example: "clx1234567890",
                },
                paidAmount: {
                  type: "number",
                  example: 1000.5,
                },
              },
              required: ["payerId", "paidAmount"],
            },
            example: [
              {
                payerId: "clx1234567890",
                paidAmount: 1000.5,
              },
            ],
          },
          shares: {
            type: "array",
            description: "Transaction shares (for v2.0 - defaults to creator if not provided). Total shareAmount must equal transaction amount.",
            items: {
              type: "object",
              properties: {
                userId: {
                  type: "string",
                  example: "clx1234567890",
                },
                shareAmount: {
                  type: "number",
                  example: 500.25,
                },
              },
              required: ["userId", "shareAmount"],
            },
            example: [
              {
                userId: "clx1234567890",
                shareAmount: 500.25,
              },
              {
                userId: "clx0987654321",
                shareAmount: 500.25,
              },
            ],
          },
        },
        required: ["walletId", "date", "amount", "tagId"],
      },
      UpdateTransactionRequest: {
        type: "object",
        properties: {
          date: {
            type: "string",
            format: "date-time",
            description: "Transaction date (ISO 8601)",
            example: "2024-01-15T10:30:00Z",
          },
          amount: {
            type: "number",
            description: "Transaction amount",
            example: 1000.5,
          },
          currency: {
            type: "string",
            description: "Currency code",
            example: "USD",
          },
          rateToNTD: {
            type: "number",
            nullable: true,
            description: "Exchange rate to NTD",
            example: 30.5,
          },
          name: {
            type: "string",
            nullable: true,
            description: "Transaction name/description",
            example: "Updated Lunch",
          },
          note: {
            type: "string",
            nullable: true,
            description: "Transaction note",
            example: "Updated note",
          },
          type: {
            type: "string",
            enum: ["INCOME", "EXPENSE"],
            description: "Transaction type - INCOME for income, EXPENSE for expense",
            example: "EXPENSE",
          },
          tagId: {
            type: "string",
            description: "Tag ID (required, must exist in database)",
            example: "clx1234567890",
          },
          payers: {
            type: "array",
            description: "Transaction payers (for v2.0). Total paidAmount must equal transaction amount.",
            items: {
              type: "object",
              properties: {
                payerId: {
                  type: "string",
                  example: "clx1234567890",
                },
                paidAmount: {
                  type: "number",
                  example: 1000.5,
                },
              },
              required: ["payerId", "paidAmount"],
            },
            example: [
              {
                payerId: "clx1234567890",
                paidAmount: 1000.5,
              },
            ],
          },
          shares: {
            type: "array",
            description: "Transaction shares (for v2.0). Total shareAmount must equal transaction amount.",
            items: {
              type: "object",
              properties: {
                userId: {
                  type: "string",
                  example: "clx1234567890",
                },
                shareAmount: {
                  type: "number",
                  example: 500.25,
                },
              },
              required: ["userId", "shareAmount"],
            },
            example: [
              {
                userId: "clx1234567890",
                shareAmount: 500.25,
              },
              {
                userId: "clx0987654321",
                shareAmount: 500.25,
              },
            ],
          },
        },
      },
      Tag: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Tag ID",
          },
          name: {
            type: "string",
            description: "Tag name",
          },
          createdBy: {
            type: "string",
            description: "User ID who created the tag",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
          },
          isDeleted: {
            type: "boolean",
            description: "Soft delete flag",
          },
          creator: {
            type: "object",
            nullable: true,
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
          },
        },
        required: ["id", "name", "createdBy", "createdAt", "isDeleted"],
      },
      CreateTagRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Tag name (must be unique)",
            example: "groceries",
          },
        },
        required: ["name"],
      },
      UpdateTagRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Tag name (must be unique)",
            example: "updated-groceries",
          },
        },
      },
      MonthlySummary: {
        type: "object",
        properties: {
          walletId: {
            type: "string",
            description: "Wallet ID",
          },
          year: {
            type: "integer",
            description: "Year",
            example: 2024,
          },
          month: {
            type: "integer",
            description: "Month (1-12)",
            example: 11,
          },
          totalIncome: {
            type: "number",
            description: "Total income for the month in target currency",
            example: 50000.0,
          },
          totalExpense: {
            type: "number",
            description: "Total expense for the month in target currency",
            example: 30000.0,
          },
          netAmount: {
            type: "number",
            description: "Net amount (totalIncome - totalExpense)",
            example: 20000.0,
          },
          currency: {
            type: "string",
            description: "Currency of the summary amounts",
            example: "TWD",
          },
          incomeCount: {
            type: "integer",
            description: "Number of income transactions",
            example: 5,
          },
          expenseCount: {
            type: "integer",
            description: "Number of expense transactions",
            example: 10,
          },
        },
        required: [
          "walletId",
          "year",
          "month",
          "totalIncome",
          "totalExpense",
          "netAmount",
          "currency",
          "incomeCount",
          "expenseCount",
        ],
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





