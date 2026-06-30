CREATE TABLE `music_comments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `content` text,
  `root_id` integer,
  `reply_to_comment_id` integer,
  `status` text DEFAULT 'published' NOT NULL,
  `ai_reason` text,
  `song_id` text NOT NULL,
  `user_id` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`root_id`) REFERENCES `music_comments`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`reply_to_comment_id`) REFERENCES `music_comments`(`id`) ON UPDATE no action ON DELETE set null,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `music_comments_song_root_created_idx` ON `music_comments` (`song_id`,`root_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `music_comments_user_created_idx` ON `music_comments` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `music_comments_status_created_idx` ON `music_comments` (`status`,`created_at`);
