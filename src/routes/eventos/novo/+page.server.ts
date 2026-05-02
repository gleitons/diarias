import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }
    return {};
};

async function generateUniqueCode(): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await db.select().from(events).where(eq(events.code, code)).get();
    if (existing) {
        return generateUniqueCode();
    }
    return code;
}

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const state = formData.get('state') as string;
        const city = formData.get('city') as string;
        const distance = parseFloat(formData.get('distance') as string);
        const description = formData.get('description') as string;

        const code = await generateUniqueCode();

        try {
            await db.insert(events).values({
                code,
                name,
                state,
                city,
                distance,
                description,
                userId: locals.user.id
            });

            return { success: true, code };
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Erro ao criar evento' });
        }
    }
};
