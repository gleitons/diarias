import { auth } from "$lib/server/auth"; // path to your auth file
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
	return auth.handler(request);
};

export const POST: RequestHandler = async ({ request }) => {
	return auth.handler(request);
};
