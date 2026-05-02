import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, priceZones } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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
	
	return {
		user: locals.user,
		priceZones: zones
	};
};

export const actions: Actions = {
	submit: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const destinoCidadeUf = formData.get('destinoCidadeUf') as string;
		const objetivoViagem = formData.get('objetivoViagem') as string;
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
		
		// Total calculation (simplified for now)
		const valorTotalSolicitado = parseFloat(formData.get('valorTotalSolicitado') as string) || 0;

		const code = await generateUniqueCode();

		const dataSolicitacao = new Date(formData.get('dataSolicitacao') as string);

		try {
			await db.insert(dailyRequests).values({
				userId: locals.user.id,
				code,
				exercicio: new Date().getFullYear(),
				dataSolicitacao,
				destinoCidadeUf,
				objetivoViagem,
				dataSaida: new Date(dataSaida),
				dataRetorno: new Date(dataRetorno),
				meioTransporte,
				veiculoOficialPlaca,
				veiculoParticular,
				justificativaVeiculoParticular,
				distanciaIdaVolta,
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
