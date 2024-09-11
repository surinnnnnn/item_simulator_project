/*
  Warnings:

  - The primary key for the `Item_inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Item_equippted` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[character_id,item_Code]` on the table `Item_inventory` will be added. If there are existing duplicate values, this will fail.
  - Made the column `item_Name` on table `Item_inventory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `count` on table `Item_inventory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `health` on table `Item_inventory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `power` on table `Item_inventory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Item_inventory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Item_equippted` DROP FOREIGN KEY `Item_equippted_character_id_item_Code_fkey`;

-- AlterTable
ALTER TABLE `Item_inventory` DROP PRIMARY KEY,
    MODIFY `item_Name` VARCHAR(191) NOT NULL,
    MODIFY `count` INTEGER NOT NULL,
    MODIFY `health` INTEGER NOT NULL,
    MODIFY `power` INTEGER NOT NULL,
    MODIFY `price` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Item_equippted`;

-- CreateTable
CREATE TABLE `Item_equipped` (
    `character_id` INTEGER NOT NULL,
    `item_Code` INTEGER NOT NULL,
    `health` INTEGER NOT NULL,
    `power` INTEGER NOT NULL,

    PRIMARY KEY (`character_id`, `item_Code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Item_inventory_character_id_item_Code_key` ON `Item_inventory`(`character_id`, `item_Code`);

-- AddForeignKey
ALTER TABLE `Item_equipped` ADD CONSTRAINT `Item_equipped_character_id_item_Code_fkey` FOREIGN KEY (`character_id`, `item_Code`) REFERENCES `Item_inventory`(`character_id`, `item_Code`) ON DELETE CASCADE ON UPDATE CASCADE;
