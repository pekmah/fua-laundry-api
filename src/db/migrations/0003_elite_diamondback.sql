CREATE TABLE `laundry_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`unit_price` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
DROP INDEX IF EXISTS `users_phone_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `laundry_categories_unit_price_unique` ON `laundry_categories` (`unit_price`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `phone`;