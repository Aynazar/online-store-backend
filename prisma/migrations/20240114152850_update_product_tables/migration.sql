/*
  Warnings:

  - You are about to alter the column `description` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(357)` to `VarChar(357)`.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "frame" TEXT,
ADD COLUMN     "screen" TEXT,
ADD COLUMN     "screen_size" TEXT,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(357);
