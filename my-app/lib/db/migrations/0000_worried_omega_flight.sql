CREATE TABLE `checkin_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`checkin_at` integer NOT NULL,
	`event_id` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_name` text NOT NULL,
	`date` integer NOT NULL,
	`location` text NOT NULL,
	`descripti` text NOT NULL,
	`status` text NOT NULL,
	`organizer_id` text NOT NULL,
	FOREIGN KEY (`organizer_id`) REFERENCES `organizers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group_of_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`quantity_available` integer NOT NULL,
	`event_id` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizers` (
	`id` text PRIMARY KEY NOT NULL,
	`organizer_name` text NOT NULL,
	`trusted_contact` text NOT NULL,
	`status` text NOT NULL,
	`user_id` text NOT NULL
);
