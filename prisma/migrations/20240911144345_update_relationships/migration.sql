-- CreateTable
CREATE TABLE `User_info` (
    `user_id` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `character_count` INTEGER NOT NULL DEFAULT 0,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Character` (
    `character_id` INTEGER NOT NULL AUTO_INCREMENT,
    `character_name` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `health` INTEGER NOT NULL DEFAULT 100,
    `power` INTEGER NOT NULL DEFAULT 20,
    `money` INTEGER NOT NULL DEFAULT 10000,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Character_character_name_key`(`character_name`),
    INDEX `Character_user_id_fkey`(`user_id`),
    PRIMARY KEY (`character_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `item_Code` INTEGER NOT NULL,
    `item_Name` VARCHAR(191) NOT NULL,
    `health` INTEGER NOT NULL DEFAULT 0,
    `power` INTEGER NOT NULL DEFAULT 0,
    `price` INTEGER NOT NULL DEFAULT 10,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`item_Code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_inventory` (
    `character_id` INTEGER NOT NULL,
    `item_Code` INTEGER NOT NULL,
    `item_Name` VARCHAR(191) NULL,
    `count` INTEGER NULL,
    `health` INTEGER NULL,
    `power` INTEGER NULL,
    `price` INTEGER NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Item_inventory_character_id_key`(`character_id`),
    PRIMARY KEY (`character_id`, `item_Code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item_equippted` (
    `character_id` INTEGER NOT NULL,
    `item_Code` INTEGER NOT NULL,
    `health` INTEGER NOT NULL,
    `power` INTEGER NOT NULL,

    INDEX `Item_equipped_character_id_fkey`(`character_id`),
    UNIQUE INDEX `Item_equippted_character_id_item_Code_key`(`character_id`, `item_Code`),
    PRIMARY KEY (`character_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User_info`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_inventory` ADD CONSTRAINT `Item_inventory_item_Code_fkey` FOREIGN KEY (`item_Code`) REFERENCES `Item`(`item_Code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_inventory` ADD CONSTRAINT `Item_inventory_character_id_fkey` FOREIGN KEY (`character_id`) REFERENCES `Character`(`character_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item_equippted` ADD CONSTRAINT `Item_equippted_character_id_item_Code_fkey` FOREIGN KEY (`character_id`, `item_Code`) REFERENCES `Item_inventory`(`character_id`, `item_Code`) ON DELETE CASCADE ON UPDATE CASCADE;
