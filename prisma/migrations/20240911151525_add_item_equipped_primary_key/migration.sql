/*
  Warnings:

  - The primary key for the `Item_equipped` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[item_Code]` on the table `Item_inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Item_equipped` DROP FOREIGN KEY `Item_equipped_character_id_item_Code_fkey`;

-- DropIndex
DROP INDEX `Item_inventory_character_id_item_Code_key` ON `Item_inventory`;

-- AlterTable
ALTER TABLE `Item_equipped` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`item_Code`);

-- CreateIndex
CREATE UNIQUE INDEX `Item_inventory_item_Code_key` ON `Item_inventory`(`item_Code`);

-- AddForeignKey
ALTER TABLE `Item_equipped` ADD CONSTRAINT `Item_equipped_character_id_fkey` FOREIGN KEY (`character_id`) REFERENCES `Character`(`character_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_equipped` ADD CONSTRAINT `Item_equipped_item_Code_fkey` FOREIGN KEY (`item_Code`) REFERENCES `Item_inventory`(`item_Code`) ON DELETE CASCADE ON UPDATE CASCADE;
