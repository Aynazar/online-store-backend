/*
  Warnings:

  - The `collection` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Collection" AS ENUM ('PHONES', 'DRONS', 'TABLETS', 'COMPUTERS');

-- AlterTable
ALTER TABLE "products" DROP COLUMN "collection",
ADD COLUMN     "collection" "Collection"[];
