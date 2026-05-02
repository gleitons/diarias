import { db } from '$lib/server/db';
import { settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || (locals.user.role !== 'adm_diarias' && locals.user.role !== 'adm_geral')) {
		throw redirect(303, '/');
	}

	const config = await db.select().from(settings).get();
	
	return {
		config
	};
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		
		const prefeituraNome = formData.get('prefeituraNome') as string;
		const prefeituraEndereco = formData.get('prefeituraEndereco') as string;
		const prefeituraCep = formData.get('prefeituraCep') as string;
		const prefeituraLei = formData.get('prefeituraLei') as string;
		const prefeitoNome = formData.get('prefeitoNome') as string;
		const logoUrl = formData.get('logoUrl') as string;
		const valorIndenizacaoKm = parseFloat(formData.get('valorIndenizacaoKm') as string);

		const existing = await db.select().from(settings).get();

		if (existing) {
			await db.update(settings).set({
				prefeituraNome,
				prefeituraEndereco,
				prefeituraCep,
				prefeituraLei,
				prefeitoNome,
				logoUrl,
				valorIndenizacaoKm
			}).where(eq(settings.id, existing.id));
		} else {
			await db.insert(settings).values({
				prefeituraNome,
				prefeituraEndereco,
				prefeituraCep,
				prefeituraLei,
				prefeitoNome,
				logoUrl,
				valorIndenizacaoKm
			});
		}

		return { success: true };
	}
};
