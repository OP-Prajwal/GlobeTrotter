import { pgTable, text, timestamp, uuid, integer, jsonb, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    supabaseId: text('supabase_id').unique().notNull(), // Link to Supabase Auth
    email: text('email').unique().notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const trips = pgTable('trips', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    budget: decimal('budget', { precision: 10, scale: 2 }), // User's set budget
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stops = pgTable('stops', {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
    order: integer('order').notNull(), // For drag-and-drop reordering
    locationName: text('location_name').notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 6 }),
    longitude: decimal('longitude', { precision: 10, scale: 6 }),
    arrivalDate: timestamp('arrival_date'),
    departureDate: timestamp('departure_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activities = pgTable('activities', {
    id: uuid('id').primaryKey().defaultRandom(),
    stopId: uuid('stop_id').references(() => stops.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    cost: decimal('cost', { precision: 10, scale: 2 }), // For budget calculation
    category: text('category'), // e.g., 'food', 'action', 'stay'
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
