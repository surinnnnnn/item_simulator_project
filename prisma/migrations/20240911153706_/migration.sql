/*
  Warnings:

  - The primary key for the `Item_equipped` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[item_Code]` on the table `Item_equipped` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Item_window_No` to the `Item_equipped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventory_No` to the `Item_inventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Item_equipped` DROP PRIMARY KEY,
    ADD COLUMN `Item_window_No` INTEGER NOT NULL,
    ADD PRIMARY KEY (`Item_window_No`);

-- AlterTable
ALTER TABLE `Item_inventory` ADD COLUMN `inventory_No` INTEGER NOT NULL,
    ADD PRIMARY KEY (`inventory_No`);

-- CreateIndex
CREATE UNIQUE INDEX `Item_equipped_item_Code_key` ON `Item_equipped`(`item_Code`);
