import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, accountabilityReports } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	
	const id = parseInt(params.id);
	const request = await db.select()
		.from(dailyRequests)
		.where(eq(dailyRequests.id, id))
		.get();
	
	if (!request || request.userId !== locals.user.id) {
		throw redirect(303, '/minhas-diarias');
	}

	if (request.status !== 'aprovada') {
		throw redirect(303, '/minhas-diarias');
	}

	// Check if already reported
	const existingReport = await db.select()
		.from(accountabilityReports)
		.where(eq(accountabilityReports.dailyRequestId, id))
		.get();
	
	return {
		request,
		existingReport
	};
};

export const actions: Actions = {
	submit: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401);

		const id = parseInt(params.id);
		const formData = await request.formData();
		
		const quantidadePernoites = parseInt(formData.get('quantidadePernoites') as string);
		const dataHoraPartida = new Date(formData.get('dataHoraPartida') as string);
		const dataHoraChegada = new Date(formData.get('dataHoraChegada') as string);
		const relatorioDetalhado = formData.get('relatorioDetalhado') as string;
		
		const inexistenciaResidenciaPropria = formData.get('inexistenciaResidenciaPropria') === 'on';
		const anexoPassagens = formData.get('anexoPassagens') === 'on';
		const anexoCartoesEmbarque = formData.get('anexoCartoesEmbarque') === 'on';
		const anexoAutorizacaoVeiculo = formData.get('anexoAutorizacaoVeiculo') === 'on';
		const anexoComprovanteParticipacao = formData.get('anexoComprovanteParticipacao') === 'on';

		try {
			const existing = await db.select().from(accountabilityReports).where(eq(accountabilityReports.dailyRequestId, id)).get();

			const reportData = {
				quantidadePernoites,
				dataHoraPartida,
				dataHoraChegada,
				relatorioDetalhado,
				inexistenciaResidenciaPropria,
				anexoPassagens,
				anexoCartoesEmbarque,
				anexoAutorizacaoVeiculo,
				anexoComprovanteParticipacao,
				dataRelatorio: new Date(),
				status: 'pendente'
			};

			if (existing) {
				await db.update(accountabilityReports)
					.set(reportData)
					.where(eq(accountabilityReports.id, existing.id));
			} else {
				await db.insert(accountabilityReports).values({
					dailyRequestId: id,
					...reportData
				});
			}

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Erro ao enviar prestação de contas' });
		}
	}
};
