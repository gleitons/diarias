import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, user, settings, accountabilityReports } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateAnexoII, generateAnexoIII, generateAnexoIV } from '$lib/server/pdf';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const id = parseInt(params.id);
	const type = url.searchParams.get('type') || 'anexoII';
	
	const request = await db.select().from(dailyRequests).where(eq(dailyRequests.id, id)).get();
	if (!request) throw error(404, 'Request not found');

	// Check permission (only owner or admin)
	if (request.userId !== locals.user.id && locals.user.role === 'solicitante') {
		throw error(403, 'Forbidden');
	}

	const userData = await db.select().from(user).where(eq(user.id, request.userId)).get();
	const config = await db.select().from(settings).get();

	if (!userData || !config) throw error(500, 'Missing data');

	let pdfBytes: Uint8Array;
	let filename = `diaria-${id}.pdf`;

	if (type === 'anexoIII' || type === 'anexoIV') {
		const report = await db.select().from(accountabilityReports).where(eq(accountabilityReports.dailyRequestId, id)).get();
		if (!report) throw error(404, 'Accountability report not found');
		
		if (type === 'anexoIV') {
			pdfBytes = await generateAnexoIV(request, userData, config, report);
			filename = `homologacao-${id}.pdf`;
		} else {
			pdfBytes = await generateAnexoIII(request, userData, config, report);
			filename = `prestacao-contas-${id}.pdf`;
		}
	} else {
		pdfBytes = await generateAnexoII(request, userData, config);
	}

	return new Response(pdfBytes, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
