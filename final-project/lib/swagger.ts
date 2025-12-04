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
            example: "Unauthorized",
          },
        },
        required: ["error"],
      },
      CurrentUser: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "User ID (internal database ID)",
            example: "user-1",
          },
          userID: {
            type: "string",
            nullable: true,
            description: "User ID (public identifier, may be null if not registered)",
            example: "user1",
          },
          name: {
            type: "string",
            description: "User display name",
            example: "User One",
          },
          email: {
            type: "string",
            nullable: true,
            description: "User email address",
            example: "user1@example.com",
          },
          image: {
            type: "string",
            nullable: true,
            description: "User profile image URL",
            example: null,
          },
        },
        required: ["id", "name"],
      },
      Wallet: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Wallet ID",
            example: "wallet-1",
          },
          name: {
            type: "string",
            description: "Wallet name",
            example: "Personal Wallet",
          },
          defaultCurrency: {
            type: "string",
            description: "Default currency code (e.g., TWD)",
            default: "TWD",
            example: "TWD",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
            example: "2024-11-01T00:00:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
            example: "2024-11-01T00:00:00Z",
          },
          isDeleted: {
            type: "boolean",
            description: "Soft delete flag",
            example: false,
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
            example: "wallet-user-1",
          },
          userId: {
            type: "string",
            example: "user-1",
          },
          role: {
            type: "string",
            enum: ["OWNER", "MEMBER", "VIEWER"],
            example: "OWNER",
          },
          user: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "user-1",
              },
              name: {
                type: "string",
                example: "User One",
              },
              email: {
                type: "string",
                nullable: true,
                example: "user1@example.com",
              },
              image: {
                type: "string",
                nullable: true,
                example: null,
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
            example: "transaction-1",
          },
          walletId: {
            type: "string",
            description: "Wallet ID",
            example: "wallet-1",
          },
          createdById: {
            type: "string",
            description: "User ID who created the transaction",
            example: "user-1",
          },
          date: {
            type: "string",
            format: "date-time",
            description: "Transaction date",
            example: "2024-11-15T10:00:00Z",
          },
          amount: {
            type: "number",
            description: "Transaction amount",
            example: 5000,
          },
          currency: {
            type: "string",
            description: "Currency code (e.g., TWD, USD)",
            example: "TWD",
          },
          rateToNTD: {
            type: "number",
            nullable: true,
            description: "Exchange rate to NTD",
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
          isDeleted: {
            type: "boolean",
            description: "Soft delete flag",
            example: false,
          },
          type: {
            type: "string",
            enum: ["INCOME", "EXPENSE"],
            description: "Transaction type - INCOME for income, EXPENSE for expense",
            default: "EXPENSE",
            example: "EXPENSE",
          },
          tagId: {
            type: "string",
            nullable: true,
            description: "Tag ID",
            example: "system-tag-food",
          },
          tag: {
            type: "object",
            nullable: true,
            properties: {
              id: {
                type: "string",
                example: "system-tag-food",
              },
              name: {
                type: "string",
                example: "food",
              },
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
            example: "2024-11-15T10:00:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
            example: "2024-11-15T10:00:00Z",
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
                example: "user-1",
              },
              name: {
                type: "string",
                example: "User One",
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
            example: "payer-1",
          },
          transactionId: {
            type: "string",
            example: "transaction-1",
          },
          payerId: {
            type: "string",
            example: "user-1",
          },
          paidAmount: {
            type: "number",
            example: 5000,
          },
          payer: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "user-1",
              },
              name: {
                type: "string",
                example: "User One",
              },
              image: {
                type: "string",
                nullable: true,
                example: null,
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
            example: "share-1",
          },
          transactionId: {
            type: "string",
            example: "transaction-1",
          },
          userId: {
            type: "string",
            example: "user-1",
          },
          shareAmount: {
            type: "number",
            example: 5000,
          },
          user: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "user-1",
              },
              name: {
                type: "string",
                example: "User One",
              },
              image: {
                type: "string",
                nullable: true,
                example: null,
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
            example: "wallet-1",
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
            example: "system-tag-food",
          },
          payers: {
            type: "array",
            description: "Transaction payers (for v2.0 - defaults to creator if not provided). Total paidAmount must equal transaction amount.",
            items: {
              type: "object",
              properties: {
                payerId: {
                  type: "string",
                  example: "user-1",
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
                payerId: "user-1",
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
                  example: "user-1",
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
                userId: "user-1",
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
            example: "system-tag-drinks",
          },
          payers: {
            type: "array",
            description: "Transaction payers (for v2.0). Total paidAmount must equal transaction amount.",
            items: {
              type: "object",
              properties: {
                payerId: {
                  type: "string",
                  example: "user-1",
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
                payerId: "user-1",
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
                  example: "user-1",
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
                userId: "user-1",
                shareAmount: 50,
              },
              {
                userId: "user-2",
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
            example: "system-tag-food",
          },
          name: {
            type: "string",
            description: "Tag name",
            example: "food",
          },
          createdBy: {
            type: "string",
            description: "User ID who created the tag",
            example: "system",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
            example: "2024-11-01T00:00:00Z",
          },
          isDeleted: {
            type: "boolean",
            description: "Soft delete flag",
            example: false,
          },
          creator: {
            type: "object",
            nullable: true,
            properties: {
              id: {
                type: "string",
                example: "system",
              },
              name: {
                type: "string",
                example: "System",
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
            example: "transaction-1",
          },
          date: {
            type: "string",
            format: "date-time",
            description: "Transaction date",
            example: "2024-11-15T10:00:00Z",
          },
          amount: {
            type: "number",
            description: "Transaction amount in target currency",
            example: 5000,
          },
          currency: {
            type: "string",
            description: "Currency of the amount",
            example: "TWD",
          },
          name: {
            type: "string",
            nullable: true,
            description: "Transaction name",
            example: "Lunch with team",
          },
          note: {
            type: "string",
            nullable: true,
            description: "Transaction note",
            example: "Team lunch at restaurant",
          },
          tag: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "system-tag-food",
              },
              name: {
                type: "string",
                example: "food",
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
            example: "wallet-1",
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
            example: [
              {
                id: "3",
                date: "2024-11-25T09:00:00Z",
                amount: 50000,
                currency: "TWD",
                name: "Salary",
                note: "Monthly salary",
                tag: {
                  id: "custom-tag-1",
                  name: "custom-tag-1",
                },
              },
            ],
          },
          expenses: {
            type: "array",
            description: "List of expense transactions",
            items: {
              $ref: "#/components/schemas/TransactionSummaryItem",
            },
            example: [
              {
                id: "1",
                date: "2024-11-15T10:00:00Z",
                amount: 5000,
                currency: "TWD",
                name: "Lunch with team",
                note: "Team lunch at restaurant",
                tag: {
                  id: "system-tag-food",
                  name: "food",
                },
              },
            ],
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





