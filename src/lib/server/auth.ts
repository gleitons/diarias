import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { admin } from 'better-auth/plugins';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as schema from './db/schema';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite', schema }),
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			role: { type: 'string', required: true, defaultValue: 'solicitante' },
			matricula: { type: 'string' },
			unidadeAdministrativa: { type: 'string' },
			cpf: { type: 'string' },
			cargo: { type: 'string' },
			bancoNome: { type: 'string' },
			bancoAgenciaCod: { type: 'string' },
			bancoAgenciaNum: { type: 'string' },
			bancoContaNum: { type: 'string' },
			phone: { type: 'string' },
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent),
		admin()
	]
});
