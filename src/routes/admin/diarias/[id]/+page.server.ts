import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, user,  accountabilityReports } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user || (locals.user.role !== 'adm_diarias' && locals.user.role !== 'adm_geral')) {
		throw redirect(303, '/');
	}
	
	const codigo = params.id;
	const data = await db.select({
		request: dailyRequests,
		user: user,
		report: accountabilityReports
	})
	.from(dailyRequests)
	.innerJoin(user, eq(dailyRequests.userId, user.id))
	.leftJoin(accountabilityReports, eq(dailyRequests.id, accountabilityReports.dailyRequestId))
	.where(eq(dailyRequests.code, codigo))
	.get();
	
	if (!data) throw redirect(303, '/admin/diarias');
	
	return {
		item: data
	};
};

export const actions: Actions = {
	approveRequest: async ({ params, locals }) => {
		if (!locals.user) return fail(401);
		const id = parseInt(params.id);
		
		const request = await db.select().from(dailyRequests).where(eq(dailyRequests.code, params.id)).get();
		if (!request) return fail(404, { message: 'Solicitação não encontrada' });

		await db.update(dailyRequests)
			.set({ 
				status: 'aprovada',
				valorDiariasAprovado: request.valorDiariasSolicitado,
				valorTotalAprovado: request.valorTotalSolicitado
			})
			.where(eq(dailyRequests.code, params.id));

		return { success: true };
	},
	rejectRequest: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401);
		const id = parseInt(params.id);
		const formData = await request.formData();
		const justificativaRejeicao = formData.get('justificativaRejeicao') as string;
		await db.update(dailyRequests)
			.set({ 
				status: 'rejeitada',
				justificativaRejeicao
			})
			.where(eq(dailyRequests.code, params.id));
			
		return { success: true };
	},
	homologate: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401);
		const id = parseInt(params.id);
		const formData = await request.formData();
		
		const contabilidadeDataStr = formData.get('contabilidadeData') as string;
		const homologacaoDataStr = formData.get('homologacaoData') as string;
		
		const contabilidadeParecer = formData.get('contabilidadeParecer') as string;
		const homologacaoStatus = formData.get('homologacaoStatus') as string;
		
		const anexoPassagens = formData.get('anexoPassagens') === 'on';
		const anexoCartoesEmbarque = formData.get('anexoCartoesEmbarque') === 'on';
		const anexoAutorizacaoVeiculo = formData.get('anexoAutorizacaoVeiculo') === 'on';

		await db.update(accountabilityReports)
			.set({
				contabilidadeParecer,
				contabilidadeData: contabilidadeDataStr ? new Date(contabilidadeDataStr + 'T12:00:00Z') : new Date(),
				homologacaoStatus,
				homologacaoData: homologacaoDataStr ? new Date(homologacaoDataStr + 'T12:00:00Z') : new Date(),
				anexoPassagens,
				anexoCartoesEmbarque,
				anexoAutorizacaoVeiculo,
				status: homologacaoStatus === 'REPROVADA' ? 'rejeitada' : 'aprovada'
			})
			.where(eq(accountabilityReports.dailyRequestId, id));

		return { success: true };
	}
};
