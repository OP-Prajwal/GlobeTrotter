"use server"

import { db } from "@/lib/db"
import { comments, users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function addComment(tripId: string, userId: string, content: string) {
    try {
        if (!content || !content.trim()) return { success: false, error: "Empty comment" }

        await db.insert(comments).values({
            tripId,
            userId,
            content,
        })

        revalidatePath("/community")
        return { success: true }
    } catch (error) {
        console.error("Error adding comment:", error)
        return { success: false, error: "Failed to add comment" }
    }
}

export async function getComments(tripId: string) {
    try {
        const result = await db.select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            user: {
                firstName: users.firstName,
                lastName: users.lastName,
                avatarUrl: users.avatarUrl,
            }
        })
            .from(comments)
            .leftJoin(users, eq(comments.userId, users.id))
            .where(eq(comments.tripId, tripId))
            .orderBy(desc(comments.createdAt))

        return result
    } catch (error) {
        console.error("Error fetching comments:", error)
        return []
    }
}
