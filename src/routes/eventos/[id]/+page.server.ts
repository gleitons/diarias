import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    const id = parseInt(params.id);
    const event = await db.select()
        .from(events)
        .where(and(
            eq(events.id, id),
            eq(events.userId, locals.user.id)
        ))
        .get();

    if (!event) {
        throw error(404, 'Evento não encontrado');
    }

    return {
        event
    };
};

export const actions: Actions = {
    update: async ({ request, params, locals }) => {
        if (!locals.user) return fail(401);

        const id = parseInt(params.id);
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const state = formData.get('state') as string;
        const city = formData.get('city') as string;
        const distance = parseFloat(formData.get('distance') as string);
        const description = formData.get('description') as string;

        try {
            await db.update(events)
                .set({
                    name,
                    state,
                    city,
                    distance,
                    description
                })
                .where(and(
                    eq(events.id, id),
                    eq(events.userId, locals.user.id)
                ));

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Erro ao atualizar evento' });
        }
    },
    delete: async ({ params, locals }) => {
        if (!locals.user) return fail(401);

        const id = parseInt(params.id);
        
        try {
            await db.delete(events)
                .where(and(
                    eq(events.id, id),
                    eq(events.userId, locals.user.id)
                ));
            
            throw redirect(303, '/eventos');
        } catch (e: any) {
            if (e.status === 303) throw e;
            console.error(e);
            return fail(500, { message: 'Erro ao excluir evento' });
        }
    }
};
