CREATE TABLE `user_role_verifications` (
	`id` integer PRIMARY KEY,
	`user_id` integer NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`evidence` text,
	`reviewed_by` integer,
	`reviewed_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_verification_user_id` ON `user_role_verifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_verification_status` ON `user_role_verifications` (`status`);--> statement-breakpoint
CREATE TABLE `user_role_requests` (
	`id` integer PRIMARY KEY,
	`user_id` integer NOT NULL,
	`requested_role` text NOT NULL,
	`current_role` text NOT NULL,
	`reason` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` integer,
	`reviewed_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_role_request_user_id` ON `user_role_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_role_request_status` ON `user_role_requests` (`status`);--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'learner' NOT NULL;