/*
  Warnings:

  - Made the column `tagId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/

-- Step 1: Handle existing NULL tagId values
-- First, check if there are any NULL values
DO $$
DECLARE
    default_tag_id TEXT;
    first_user_id TEXT;
    null_count INTEGER;
BEGIN
    -- Check if there are any NULL tagId values
    SELECT COUNT(*) INTO null_count FROM "Transaction" WHERE "tagId" IS NULL;
    
    -- Only proceed if there are NULL values
    IF null_count > 0 THEN
        -- Get the first user ID (for creating the default tag)
        SELECT id INTO first_user_id FROM "User" WHERE "isDeleted" = false LIMIT 1;
        
        -- If no user exists, try to get any user
        IF first_user_id IS NULL THEN
            SELECT id INTO first_user_id FROM "User" LIMIT 1;
        END IF;
        
        -- If still no user, we'll need to handle this differently
        -- For now, we'll try to get an existing tag
        IF first_user_id IS NULL THEN
            SELECT id INTO default_tag_id FROM "Tag" WHERE "isDeleted" = false LIMIT 1;
            
            -- If no tag exists, we can't proceed
            IF default_tag_id IS NULL THEN
                RAISE EXCEPTION 'No user or tag found. Cannot set default tag for transactions.';
            END IF;
        ELSE
            -- Check if a default tag exists, if not create one
            SELECT id INTO default_tag_id FROM "Tag" WHERE "name" = '未分類' AND "isDeleted" = false LIMIT 1;
            
            IF default_tag_id IS NULL THEN
                -- Create default tag
                INSERT INTO "Tag" ("id", "name", "createdBy", "createdAt", "isDeleted")
                VALUES (gen_random_uuid()::TEXT, '未分類', first_user_id, NOW(), false)
                RETURNING id INTO default_tag_id;
            END IF;
        END IF;
        
        -- Update all NULL tagId values to the default tag
        UPDATE "Transaction"
        SET "tagId" = default_tag_id
        WHERE "tagId" IS NULL;
    END IF;
END $$;

-- Step 2: Drop the foreign key constraint temporarily
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_tagId_fkey";

-- Step 3: Alter the column to be NOT NULL
ALTER TABLE "Transaction" ALTER COLUMN "tagId" SET NOT NULL;

-- Step 4: Re-add the foreign key constraint
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
