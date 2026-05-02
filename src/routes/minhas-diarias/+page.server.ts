import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyRequests, accountabilityReports } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	
	const requests = await db.select({
		request: dailyRequests,
		report: accountabilityReports
	})
	.from(dailyRequests)
	.leftJoin(accountabilityReports, eq(dailyRequests.id, accountabilityReports.dailyRequestId))
	.where(eq(dailyRequests.userId, locals.user.id))
	.orderBy(desc(dailyRequests.createdAt));
	
	return {
		requests
	};
};
