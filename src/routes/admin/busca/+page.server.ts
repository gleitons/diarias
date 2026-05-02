import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user || (locals.user.role !== 'adm_diarias' && locals.user.role !== 'adm_geral')) {
		throw redirect(303, '/');
	}

	const code = url.searchParams.get('code');
	
	if (code) {
		const request = await db.select().from(dailyRequests).where(eq(dailyRequests.code, code)).get();
		if (request) {
			throw redirect(303, `/admin/diarias/${request.id}`);
		}
		return { error: 'Nenhuma solicitação encontrada com este código.' };
	}

	return {};
};
