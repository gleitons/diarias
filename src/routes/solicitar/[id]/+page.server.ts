import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, priceZones } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const id = parseInt(params.id);
	const request = await db.select().from(dailyRequests).where(
        and(
            eq(dailyRequests.id, id),
            eq(dailyRequests.userId, locals.user.id)
        )
    ).get();

	if (!request) {
		throw error(404, 'Solicitação não encontrada');
	}

    if (request.status !== 'pendente') {
        throw error(403, 'Apenas solicitações pendentes podem ser editadas');
    }
	
	const zones = await db.select().from(priceZones).all();
	
	return {
		request,
		priceZones: zones
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
        const id = parseInt(params.id);

        // Security check again
        const existing = await db.select().from(dailyRequests).where(
            and(
                eq(dailyRequests.id, id),
                eq(dailyRequests.userId, locals.user.id)
            )
        ).get();

        if (!existing || existing.status !== 'pendente') {
            return fail(403, { message: 'Não autorizado' });
        }

		const destinoCidadeUf = formData.get('destinoCidadeUf') as string;
		const objetivoViagem = formData.get('objetivoViagem') as string;
		const dataSolicitacao = new Date(formData.get('dataSolicitacao') as string);
		const dataSaida = new Date(formData.get('dataSaida') as string);
		const dataRetorno = new Date(formData.get('dataRetorno') as string);
		const meioTransporte = formData.get('meioTransporte') as string;
		const veiculoOficialPlaca = formData.get('veiculoOficialPlaca') as string;
		const veiculoParticular = formData.get('veiculoParticular') === 'on';
		const justificativaVeiculoParticular = formData.get('justificativaVeiculoParticular') as string;
		const distanciaIdaVolta = parseFloat(formData.get('distanciaIdaVolta') as string) || 0;
		const quantidadeDiarias = parseFloat(formData.get('quantidadeDiarias') as string) || 1;
		const tipoDiaria = formData.get('tipoDiaria') as string;

		// Calculate Price
		const zones = await db.select().from(priceZones).all();
		const sortedZones = zones.sort((a, b) => a.maxDistance - b.maxDistance);
		const zone = sortedZones.find(z => (distanciaIdaVolta / 2) <= z.maxDistance) || sortedZones[sortedZones.length - 1];
		
		const valorDiariaUnitario = zone?.price || 0;
		const valorDiariasSolicitado = valorDiariaUnitario * quantidadeDiarias;
		const valorTotalSolicitado = parseFloat(formData.get('valorTotalSolicitado') as string) || valorDiariasSolicitado;

		try {
			await db.update(dailyRequests).set({
				dataSolicitacao,
				destinoCidadeUf,
				objetivoViagem,
				dataSaida,
				dataRetorno,
				meioTransporte,
				veiculoOficialPlaca,
				veiculoParticular,
				justificativaVeiculoParticular,
				distanciaIdaVolta,
				quantidadeDiarias,
				tipoDiaria,
				valorDiariasSolicitado,
				valorTotalSolicitado,
			}).where(eq(dailyRequests.id, id));

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Erro ao atualizar solicitação' });
		}
	}
};
