import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, priceZones, settings, destinations } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

async function generateUniqueCode(): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await db.select().from(dailyRequests).where(eq(dailyRequests.code, code)).get();
    if (existing) {
        return generateUniqueCode();
    }
    return code;
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	
	const zones = await db.select().from(priceZones).all();
	const config = await db.select().from(settings).get();
	const cachedDestinations = await db.select().from(destinations).all();
	
	return {
		user: locals.user,
		priceZones: zones,
		config,
		destinations: cachedDestinations
	};
};

export const actions: Actions = {
	submit: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		console.log(formData);
		const destinoCidadeUf = formData.get('destinoCidadeUf') as string;
		const objetivoViagem = formData.get('objetivoViagem') as string;
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
		
		// Total calculation (server-side for security)
		const valorTotalSolicitado = valorDiariasSolicitado;

		const code = await generateUniqueCode();

		const dataSolicitacao = new Date(formData.get('dataSolicitacao') as string);

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

			await db.insert(dailyRequests).values({
				userId: locals.user.id,
				code,
				exercicio: new Date().getFullYear(),
				dataSolicitacao,
				destinoCidadeUf,
				objetivoViagem,
				dataSaida: new Date(dataSaida),
				dataRetorno: new Date(dataRetorno),
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
				status: 'pendente'
			});
			
			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Erro ao enviar solicitação' });
		}
	}
};
