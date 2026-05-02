<script lang="ts">
	import { enhance } from '$app/forms';
	import { ShieldCheck, AlertTriangle, ArrowRight, UserCheck } from 'lucide-svelte';

	let { data, form } = $props();
</script>

<div class="min-h-[80vh] flex items-center justify-center p-4">
	<div class="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8">
		<div class="text-center space-y-2">
			<div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-200">
				<ShieldCheck size={32} />
			</div>
			<h2 class="text-3xl font-black text-slate-800 pt-4">Configuração Admin</h2>
			<p class="text-slate-500 font-medium">Defina o primeiro administrador do sistema</p>
		</div>

		{#if data.hasAdmin}
			<div class="bg-amber-50 border border-amber-100 text-amber-700 p-6 rounded-2xl space-y-4">
				<div class="flex items-center gap-3">
					<AlertTriangle size={24} />
					<p class="font-bold">Acesso Restrito</p>
				</div>
				<p class="text-sm">Já existe um administrador configurado no sistema. Esta página só pode ser usada para a configuração inicial.</p>
				<a href="/" class="block w-full py-3 bg-white border border-amber-200 text-center rounded-xl font-bold hover:bg-amber-100 transition-colors">
					Voltar para o Início
				</a>
			</div>
		{:else}
			<div class="bg-blue-50 border border-blue-100 p-6 rounded-2xl space-y-4">
				<p class="text-sm text-blue-800 leading-relaxed">
					Você está prestes a tornar o usuário <strong>{data.currentUser.name}</strong> o administrador geral do sistema.
				</p>
				<ul class="text-xs text-blue-700 space-y-2 list-disc pl-4">
					<li>Acesso a todas as solicitações</li>
					<li>Poder de aprovação e homologação</li>
					<li>Gestão de configurações do sistema</li>
				</ul>
			</div>

			{#if form?.success}
				<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3">
					<UserCheck size={20} />
					<p class="text-sm font-bold">Privilégios concedidos! Você agora é admin.</p>
				</div>
				<a href="/admin/diarias" class="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
					Acessar Painel Admin
					<ArrowRight size={18} />
				</a>
			{:else}
				<form method="POST" action="?/promote" use:enhance>
					<button type="submit" class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
						Tornar-me Administrador
						<ShieldCheck size={18} />
					</button>
				</form>
			{/if}
		{/if}
	</div>
</div>
