import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, priceZones, destinations, settings } from '$lib/server/db/schema';
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
	const cachedDestinations = await db.select().from(destinations).all();
	
	return {
		request,
		priceZones: zones,
		destinations: cachedDestinations
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
		const horaSaida = formData.get('horaSaida') as string;
		const horaRetorno = formData.get('horaRetorno') as string;
		const meioTransporte = formData.get('meioTransporte') as string;
		const veiculoOficialPlaca = formData.get('veiculoOficialPlaca') as string;
		const veiculoParticular = formData.get('veiculoParticular') === 'on';
		const justificativaVeiculoParticular = formData.get('justificativaVeiculoParticular') as string;
		const dadosVeiculoProprio = formData.get('dadosVeiculoProprio') as string;
		const distanciaIdaVolta = parseFloat(formData.get('distanciaIdaVolta') as string) || 0;
		const quantidadeDiarias = parseFloat(formData.get('quantidadeDiarias') as string) || 1;
		const tipoDiaria = formData.get('tipoDiaria') as string;

		// Calculate Price
		const zones = await db.select().from(priceZones).all();
		const config = await db.select().from(settings).get();
		const sortedZones = zones.sort((a, b) => a.maxDistance - b.maxDistance);
		const zone = sortedZones.find(z => (distanciaIdaVolta / 2) <= z.maxDistance) || sortedZones[sortedZones.length - 1];
		
		const valorDiariaUnitario = zone?.price || 0;
		const valorDiariasSolicitado = valorDiariaUnitario * quantidadeDiarias;
		const valorTotalSolicitado = valorDiariasSolicitado;

		try {
			// Update Destination Cache if manual distance provided
			if (distanciaIdaVolta > 0) {
				const [city, uf] = destinoCidadeUf.split(' - ');
				if (city && uf) {
					const existingDest = await db.select()
						.from(destinations)
						.where(and(eq(destinations.city, city.trim()), eq(destinations.state, uf.trim())))
						.get();

					if (existingDest) {
						if (existingDest.distance !== distanciaIdaVolta) {
							await db.update(destinations)
								.set({ distance: distanciaIdaVolta })
								.where(eq(destinations.id, existingDest.id));
						}
					} else {
						await db.insert(destinations).values({
							city: city.trim(),
							state: uf.trim(),
							distance: distanciaIdaVolta
						});
					}
				}
			}

			await db.update(dailyRequests).set({
				dataSolicitacao,
				destinoCidadeUf,
				objetivoViagem,
				dataSaida,
				dataRetorno,
				horaSaida,
				horaRetorno,
				meioTransporte,
				veiculoOficialPlaca,
				veiculoParticular,
				justificativaVeiculoParticular,
				dadosVeiculoProprio,
				distanciaIdaVolta,
				valorIndenizacaoKm: config?.valorIndenizacaoKm ?? 0.8,
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
