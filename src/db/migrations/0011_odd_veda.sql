CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`whatsapp_id` text,
	`recipient` text NOT NULL,
	`template_name` text NOT NULL,
	`payload` text NOT NULL,
	`order_id` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
