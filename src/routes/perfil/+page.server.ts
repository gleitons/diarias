import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	return {
		user: locals.user
	};
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const matricula = formData.get('matricula') as string;
		const unidadeAdministrativa = formData.get('unidadeAdministrativa') as string;
		const cpf = formData.get('cpf') as string;
		const cargo = formData.get('cargo') as string;
		const bancoNome = formData.get('bancoNome') as string;
		const bancoAgenciaCod = formData.get('bancoAgenciaCod') as string;
		const bancoAgenciaNum = formData.get('bancoAgenciaNum') as string;
		const bancoContaNum = formData.get('bancoContaNum') as string;
		const phone = formData.get('phone') as string;

		try {
			await db.update(user)
				.set({
					matricula,
					unidadeAdministrativa,
					cpf,
					cargo,
					bancoNome,
					bancoAgenciaCod,
					bancoAgenciaNum,
					bancoContaNum,
					phone,
				})
				.where(eq(user.id, locals.user.id));

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Erro ao atualizar perfil' });
		}
	}
};
