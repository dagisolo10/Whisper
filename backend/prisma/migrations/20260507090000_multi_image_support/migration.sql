ALTER TABLE "User"
ADD COLUMN "mainAvatarUrl" TEXT,
ADD COLUMN "avatarUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "User"
SET
    "mainAvatarUrl" = "avatarUrl",
    "avatarUrls" = CASE
        WHEN "avatarUrl" IS NULL OR BTRIM("avatarUrl") = '' THEN ARRAY[]::TEXT[]
        ELSE ARRAY["avatarUrl"]
    END;

ALTER TABLE "User"
DROP COLUMN "avatarUrl";

ALTER TABLE "Message"
ADD COLUMN "textContent" TEXT,
ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Message"
SET
    "textContent" = CASE
        WHEN "messageType" = 'Text' THEN "content"
        ELSE NULL
    END,
    "imageUrls" = CASE
        WHEN "messageType" = 'Image' AND "content" IS NOT NULL AND BTRIM("content") <> '' THEN ARRAY["content"]
        ELSE ARRAY[]::TEXT[]
    END;

ALTER TABLE "Message"
DROP COLUMN "content";
