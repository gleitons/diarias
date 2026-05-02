<script lang="ts">
	import { authClient } from "$lib/auth-client";
	import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from "lucide-svelte";
	import { goto } from "$app/navigation";

	let email = $state("");
	let password = $state("");
	let error = $state("");
	let isLoading = $state(false);

	async function handleLogin() {
		isLoading = true;
		error = "";
		const { data, error: authError } = await authClient.signIn.email({
			email,
			password,
		});

		if (authError) {
			error = authError.message || "Erro ao fazer login. Verifique suas credenciais.";
			isLoading = false;
		} else {
			goto("/");
		}
	}
</script>

<div class="min-h-[80vh] flex items-center justify-center p-4">
	<div class="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
		<div class="text-center space-y-2">
			<div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-200 rotate-3">
				<LogIn size={32} />
			</div>
			<h2 class="text-3xl font-black text-slate-800 pt-4">Bem-vindo</h2>
			<p class="text-slate-500 font-medium">Acesse o Sistema de Diárias de Lagoa dos Patos</p>
		</div>

		{#if error}
			<div class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
				<AlertCircle size={20} />
				<p class="text-sm font-bold">{error}</p>
			</div>
		{/if}

		<form class="space-y-6" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
			<div class="space-y-4">
				<div class="space-y-2">
					<label for="email" class="text-sm font-bold text-slate-700">E-mail</label>
					<div class="relative">
						<Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input 
							id="email" type="email" bind:value={email} required
							placeholder="seu@email.com"
							class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label for="password" class="text-sm font-bold text-slate-700">Senha</label>
					<div class="relative">
						<Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input 
							id="password" type="password" bind:value={password} required
							placeholder="••••••••"
							class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						/>
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
					Entrando...
				{:else}
					Entrar no Sistema
					<ArrowRight size={18} />
				{/if}
			</button>
		</form>

		<div class="text-center pt-4">
			<p class="text-sm text-slate-500">
				Não tem uma conta? 
				<a href="/register" class="text-blue-600 font-bold hover:underline">Solicite acesso</a>
			</p>
		</div>
	</div>
</div>
