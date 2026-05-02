import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }
    
    const userEvents = await db.select()
        .from(events)
        .where(eq(events.userId, locals.user.id))
        .orderBy(desc(events.createdAt));
    
    return {
        events: userEvents
    };
};
