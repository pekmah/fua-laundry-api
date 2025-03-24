CREATE TABLE `laundry_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`laundry_category_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`laundry_category_id`) REFERENCES `laundry_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`laundry_items_id` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`payment_amount` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`laundry_items_id`) REFERENCES `laundry_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`payment_method` text NOT NULL,
	`amount` integer NOT NULL,
	`balance` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `laundry_categories` ADD `unit` text NOT NULL;