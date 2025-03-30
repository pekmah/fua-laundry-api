ALTER TABLE `orders` ADD `order_number` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `laundry_categories_name_unique` ON `laundry_categories` (`name`);