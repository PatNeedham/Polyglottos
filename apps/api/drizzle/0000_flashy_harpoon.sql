CREATE TABLE `users` (
	`id` integer PRIMARY KEY,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_email` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `language` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`languageName` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userLanguage` (
	`userId` integer NOT NULL,
	`languageId` integer NOT NULL,
	`lessonsCompleted` integer NOT NULL,
	`quizzesTaken` integer NOT NULL,
	`quizzesPassed` integer NOT NULL,
	`rollingAverageAccuracy` real NOT NULL,
	PRIMARY KEY(`userId`, `languageId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`languageId`) REFERENCES `language`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quiz` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quizType` text NOT NULL,
	`languageId` integer NOT NULL,
	`content` text NOT NULL,
	`answer` text NOT NULL,
	FOREIGN KEY (`languageId`) REFERENCES `language`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lesson` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`languageId` integer NOT NULL,
	`lessonName` text NOT NULL,
	FOREIGN KEY (`languageId`) REFERENCES `language`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lessonQuiz` (
	`lessonId` integer NOT NULL,
	`quizId` integer NOT NULL,
	PRIMARY KEY(`lessonId`, `quizId`),
	FOREIGN KEY (`lessonId`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quizId`) REFERENCES `quiz`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `topic` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`languageId` integer NOT NULL,
	`topicName` text NOT NULL,
	FOREIGN KEY (`languageId`) REFERENCES `language`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userTopic` (
	`userId` integer NOT NULL,
	`topicId` integer NOT NULL,
	`completed` integer NOT NULL,
	PRIMARY KEY(`userId`, `topicId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topicId`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `forumComment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`userId` integer NOT NULL,
	`quizId` integer NOT NULL,
	`parentId` integer,
	`upvotes` integer DEFAULT 0 NOT NULL,
	`downvotes` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quizId`) REFERENCES `quiz`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parentId`) REFERENCES `forumComment`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `commentVote` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`commentId` integer NOT NULL,
	`voteType` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`commentId`) REFERENCES `forumComment`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commentVote_userId_commentId_unique` ON `commentVote` (`userId`,`commentId`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`language` text NOT NULL,
	`description` text NOT NULL,
	`end_date` text NOT NULL,
	`is_private` integer DEFAULT 1,
	`notification_frequency` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`goal_id` integer NOT NULL,
	`frequency` text NOT NULL,
	`type` text NOT NULL,
	`last_sent` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`questions_answered` integer DEFAULT 0,
	`correct_answers` integer DEFAULT 0,
	`quizzes_taken` integer DEFAULT 0,
	`goals` text,
	`cumulative_stats` text,
	`last_updated` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`question` text NOT NULL,
	`options` text,
	`correct_answer` text NOT NULL,
	`image_url` text,
	`audio_url` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
