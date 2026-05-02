import type { User, Session } from 'better-auth/minimal';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User & {
				role: string;
				matricula?: string;
				unidadeAdministrativa?: string;
				cpf?: string;
				cargo?: string;
				bancoNome?: string;
				bancoAgenciaCod?: string;
				bancoAgenciaNum?: string;
				bancoContaNum?: string;
			};
			session?: Session;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
