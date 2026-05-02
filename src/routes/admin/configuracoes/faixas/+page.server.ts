import { db } from '$lib/server/db';
import { priceZones } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || (locals.user.role !== 'adm_diarias' && locals.user.role !== 'adm_geral')) {
		throw redirect(303, '/');
	}

	const zones = await db.select().from(priceZones).orderBy(asc(priceZones.maxDistance));
	
	return {
		zones
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		
		const id = formData.get('id') ? parseInt(formData.get('id') as string) : null;
		const maxDistance = parseFloat(formData.get('maxDistance') as string);
		const price = parseFloat(formData.get('price') as string);

		if (id) {
			await db.update(priceZones).set({ maxDistance, price }).where(eq(priceZones.id, id));
		} else {
			await db.insert(priceZones).values({ maxDistance, price });
		}

		return { success: true };
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);
		await db.delete(priceZones).where(eq(priceZones.id, id));
		return { success: true };
	}
};
