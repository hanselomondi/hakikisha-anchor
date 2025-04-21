-- CreateEnum
CREATE TYPE "Role" AS ENUM ('manufacturer', 'retailer');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'retailer';
