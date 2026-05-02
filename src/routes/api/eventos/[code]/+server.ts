import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
    const code = params.code;

    const event = await db.select().from(events).where(eq(events.code, code)).get();

    if (!event) {
        throw error(404, 'Evento não encontrado');
    }

    return json(event);
};
