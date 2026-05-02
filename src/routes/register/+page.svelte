<script lang="ts">
	import { authClient } from "$lib/auth-client";
	import { UserPlus, Mail, Lock, User, Briefcase, Hash, AlertCircle, ArrowRight } from "lucide-svelte";
	import { goto } from "$app/navigation";

	let name = $state("");
	let email = $state("");
	let password = $state("");
	let matricula = $state("");
	let cpf = $state("");
	let cargo = $state("");
	
	let error = $state("");
	let isLoading = $state(false);

	async function handleRegister() {
		isLoading = true;
		error = "";
		
		const { data, error: authError } = await authClient.signUp.email({
			email,
			password,
			name,
			// Custom fields in better-auth are passed via additionalFields or handled in schema
			// Better Auth supports additional fields if configured in auth.ts
		}, {
            onSuccess: async () => {
                // Since we have custom fields in our schema that might not be in the default signUp,
                // we'll handle them in a server action or update them right after.
                // For now, let's just sign up and redirect.
                goto("/perfil");
            },
            onError: (ctx) => {
                error = ctx.error.message || "Erro ao criar conta.";
                isLoading = false;
            }
        });
	}
</script>

<div class="min-h-[90vh] flex items-center justify-center p-4">
	<div class="w-full max-w-2xl space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
		<div class="text-center space-y-2">
			<div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-200 -rotate-3">
				<UserPlus size={32} />
			</div>
			<h2 class="text-3xl font-black text-slate-800 pt-4">Criar Conta</h2>
			<p class="text-slate-500 font-medium">Cadastre-se para solicitar diárias de viagem</p>
		</div>

		{#if error}
			<div class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
				<AlertCircle size={20} />
				<p class="text-sm font-bold">{error}</p>
			</div>
		{/if}

		<form class="space-y-6" onsubmit={(e) => { e.preventDefault(); handleRegister(); }}>
			<div class="grid grid-cols-1 md:grid-cols-1 gap-6">
				<!-- Dados Básicos -->
				<div class="space-y-4">
					<div class="space-y-2">
						<label for="name" class="text-sm font-bold text-slate-700">Nome Completo</label>
						<div class="relative">
							<User class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
							<input id="name" type="text" bind:value={name} required placeholder="João Silva"
								class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
						</div>
					</div>
					<div class="space-y-2">
						<label for="email" class="text-sm font-bold text-slate-700">E-mail Institucional</label>
						<div class="relative">
							<Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
							<input id="email" type="email" bind:value={email} required placeholder="exemplo@lagoadospatos.mg.gov.br"
								class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
						</div>
					</div>
					<div class="space-y-2">
						<label for="password" class="text-sm font-bold text-slate-700">Senha</label>
						<div class="relative">
							<Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
							<input id="password" type="password" bind:value={password} required placeholder="Mínimo 8 caracteres"
								class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
						</div>
					</div>
				</div>

				<!-- Dados Profissionais (Opcionais no Registro) -->
				<div class="space-y-4 hidden">
					<div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
						<h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
							<Briefcase size={14} />
							Dados Iniciais
						</h3>
						<p class="text-xs text-slate-500">Você poderá completar estes dados e as informações bancárias na página de perfil após o cadastro.</p>
						
						<div class="space-y-2">
							<label for="cargo" class="text-sm font-bold text-slate-700 text-xs">Cargo Principal</label>
							<input id="cargo" type="text" bind:value={cargo} placeholder="Ex: Motorista"
								class="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<label for="matricula" class="text-sm font-bold text-slate-700 text-xs">Matrícula</label>
								<input id="matricula" type="text" bind:value={matricula} placeholder="0000"
									class="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
							</div>
							<div class="space-y-2">
								<label for="cpf" class="text-sm font-bold text-slate-700 text-xs">CPF</label>
								<input id="cpf" type="text" bind:value={cpf} placeholder="000.000.000-00"
									class="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<button 
				type="submit" 
				disabled={isLoading}
				class="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
			>
				{#if isLoading}
					<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
					Criando Conta...
				{:else}
					Finalizar Cadastro
					<ArrowRight size={18} />
				{/if}
			</button>
		</form>

		<div class="text-center pt-2">
			<p class="text-sm text-slate-500">
				Já tem uma conta? 
				<a href="/login" class="text-blue-600 font-bold hover:underline">Fazer login</a>
			</p>
		</div>
	</div>
</div>
