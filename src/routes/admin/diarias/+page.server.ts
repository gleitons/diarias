import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, user, accountabilityReports } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || (locals.user.role !== 'adm_diarias' && locals.user.role !== 'adm_geral')) {
		throw redirect(303, '/');
	}
	
	const requests = await db.select({
		request: dailyRequests,
		user: user,
		report: accountabilityReports
	})
	.from(dailyRequests)
	.innerJoin(user, eq(dailyRequests.userId, user.id))
	.leftJoin(accountabilityReports, eq(dailyRequests.id, accountabilityReports.dailyRequestId))
	.orderBy(desc(dailyRequests.createdAt));
	
	return {
		requests
	};
};
