import { db } from '$lib/server/db';
import { settings, secretarias } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || (locals.user.role !== 'adm_diarias' && locals.user.role !== 'adm_geral')) {
		throw redirect(303, '/');
	}

	const config = await db.select().from(settings).get();
	const listSecretarias = await db.select().from(secretarias).all();
	
	return {
		config,
		secretarias: listSecretarias
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
	},
	createSecretaria: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		
		const nome = formData.get('nome') as string;
		const responsavel = formData.get('responsavel') as string;
		const matricula = formData.get('matricula') as string;
		const endereco = formData.get('endereco') as string;
		const cpf = formData.get('cpf') as string;
		const telefone = formData.get('telefone') as string;
		const competencia = formData.get('competencia') as string;

		await db.insert(secretarias).values({
			nome,
			responsavel,
			matricula,
			endereco,
			cpf,
			telefone,
			competencia
		});

		return { successSecretaria: true };
	},
	deleteSecretaria: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);
		
		await db.delete(secretarias).where(eq(secretarias.id, id));
		return { successDeleteSecretaria: true };
	}
};
