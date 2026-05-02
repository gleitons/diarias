import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    
    // Check if there is already an admin
    const admins = await db.select({ value: count() }).from(user).where(eq(user.role, 'adm_geral')).get();
    
    return {
        hasAdmin: (admins?.value || 0) > 0,
        currentUser: locals.user
    };
};

export const actions: Actions = {
    promote: async ({ locals }) => {
        if (!locals.user) return fail(401);
        
        // Allow promotion only if no admin exists yet
        const admins = await db.select({ value: count() }).from(user).where(eq(user.role, 'adm_geral')).get();
        if ((admins?.value || 0) > 0) {
            return fail(403, { message: 'Já existe um administrador no sistema.' });
        }

        await db.update(user)
            .set({ role: 'adm_geral' })
            .where(eq(user.id, locals.user.id));

        return { success: true };
    }
};
