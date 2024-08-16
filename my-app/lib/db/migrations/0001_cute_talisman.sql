CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`checkin_section_id` text NOT NULL,
	`group_of_ticket_id` text NOT NULL,
	`name` text NOT NULL,
	`user_email` text NOT NULL,
	`status` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`checkin_section_id`) REFERENCES `checkin_sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_of_ticket_id`) REFERENCES `group_of_tickets`(`id`) ON UPDATE no action ON DELETE cascade
);
