import { pgTable, text, timestamp, uuid, integer, jsonb, decimal, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
    isPublic: boolean('is_public').default(false).notNull(), // Shared in community
    location: text('location'), // e.g. "Paris, France"
    latitude: decimal('latitude', { precision: 10, scale: 6 }),
    longitude: decimal('longitude', { precision: 10, scale: 6 }),
    likesCount: integer('likes_count').default(0).notNull(),
    // Images array for Cloudinary
    images: text('images').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stops = pgTable('stops', {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
    order: integer('order').notNull(), // For drag-and-drop reordering
    locationName: text('location_name').notNull(),
    description: text('description'), // Notes for the section
    budget: decimal('budget', { precision: 10, scale: 2 }),
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

export const comments = pgTable('comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
    trips: many(trips),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
    user: one(users, {
        fields: [trips.userId],
        references: [users.id],
    }),
    stops: many(stops),
}));

export const stopsRelations = relations(stops, ({ one, many }) => ({
    trip: one(trips, {
        fields: [stops.tripId],
        references: [trips.id],
    }),
    activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
    stop: one(stops, {
        fields: [activities.stopId],
        references: [stops.id],
    }),
}));
