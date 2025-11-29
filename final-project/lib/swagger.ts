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
            example: "Personal Wallet",
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
            example: "Shared Wallet",
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
            example: "1",
          },
          date: {
            type: "string",
            format: "date-time",
            description: "Transaction date (ISO 8601)",
            example: "2024-11-15T10:00:00Z",
          },
          amount: {
            type: "number",
            description: "Transaction amount",
            example: 5000,
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
            example: null,
          },
          name: {
            type: "string",
            nullable: true,
            description: "Transaction name/description",
            example: "Lunch with team",
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
            example: "food",
          },
          payers: {
            type: "array",
            description: "Transaction payers (for v2.0 - defaults to creator if not provided). Total paidAmount must equal transaction amount.",
            items: {
              type: "object",
              properties: {
                payerId: {
                  type: "string",
                  example: "2",
                },
                paidAmount: {
                  type: "number",
                  example: 5000,
                },
              },
              required: ["payerId", "paidAmount"],
            },
            example: [
              {
                payerId: "2",
                paidAmount: 5000,
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
                  example: "2",
                },
                shareAmount: {
                  type: "number",
                  example: 5000,
                },
              },
              required: ["userId", "shareAmount"],
            },
            example: [
              {
                userId: "2",
                shareAmount: 5000,
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
            example: "2024-11-20T14:30:00Z",
          },
          amount: {
            type: "number",
            description: "Transaction amount",
            example: 100,
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
            example: 32.5,
          },
          name: {
            type: "string",
            nullable: true,
            description: "Transaction name/description",
            example: "Coffee",
          },
          note: {
            type: "string",
            nullable: true,
            description: "Transaction note",
            example: "Starbucks coffee",
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
            example: "drinks",
          },
          payers: {
            type: "array",
            description: "Transaction payers (for v2.0). Total paidAmount must equal transaction amount.",
            items: {
              type: "object",
              properties: {
                payerId: {
                  type: "string",
                  example: "2",
                },
                paidAmount: {
                  type: "number",
                  example: 100,
                },
              },
              required: ["payerId", "paidAmount"],
            },
            example: [
              {
                payerId: "2",
                paidAmount: 100,
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
                  example: "2",
                },
                shareAmount: {
                  type: "number",
                  example: 50,
                },
              },
              required: ["userId", "shareAmount"],
            },
            example: [
              {
                userId: "2",
                shareAmount: 50,
              },
              {
                userId: "3",
                shareAmount: 50,
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
            example: "custom-tag-1",
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
            example: "custom-tag-2",
          },
        },
      },
      TransactionSummaryItem: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Transaction ID",
          },
          date: {
            type: "string",
            format: "date-time",
            description: "Transaction date",
          },
          amount: {
            type: "number",
            description: "Transaction amount in target currency",
          },
          currency: {
            type: "string",
            description: "Currency of the amount",
          },
          name: {
            type: "string",
            nullable: true,
            description: "Transaction name",
          },
          note: {
            type: "string",
            nullable: true,
            description: "Transaction note",
          },
          tag: {
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
        required: ["id", "date", "amount", "currency", "tag"],
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
            example: 7000.0,
          },
          netAmount: {
            type: "number",
            description: "Net amount (totalIncome - totalExpense)",
            example: 43000.0,
          },
          currency: {
            type: "string",
            description: "Currency of the summary amounts",
            example: "TWD",
          },
          incomeCount: {
            type: "integer",
            description: "Number of income transactions",
            example: 1,
          },
          expenseCount: {
            type: "integer",
            description: "Number of expense transactions",
            example: 1,
          },
          incomes: {
            type: "array",
            description: "List of income transactions",
            items: {
              $ref: "#/components/schemas/TransactionSummaryItem",
            },
          },
          expenses: {
            type: "array",
            description: "List of expense transactions",
            items: {
              $ref: "#/components/schemas/TransactionSummaryItem",
            },
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
          "incomes",
          "expenses",
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





