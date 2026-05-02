import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || (locals.user.role !== 'adm_geral')) {
		throw redirect(303, '/');
	}

	const users = await db.select().from(user).orderBy(desc(user.createdAt));
	
	return {
		users
	};
};

export const actions: Actions = {
	resetPassword: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'adm_geral') return fail(401);
		
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const newPassword = formData.get('newPassword') as string;

		if (!newPassword || newPassword.length < 6) {
			return fail(400, { message: 'A senha deve ter pelo menos 6 caracteres.' });
		}

		try {
			// Using Better Auth Admin API to set password
			// Note: This requires the admin plugin to be enabled and the user to be an admin
			await auth.api.adminSetPassword({
				body: {
					userId,
					newPassword
				}
			});

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Erro ao redefinir senha.' });
		}
	},
    changeRole: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== 'adm_geral') return fail(401);
        
        const formData = await request.formData();
        const userId = formData.get('userId') as string;
        const newRole = formData.get('role') as string;

        await db.update(user).set({ role: newRole }).where(eq(user.id, userId));
        
        return { success: true };
    }
};
