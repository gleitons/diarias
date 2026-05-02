<script lang="ts">
	import { Search, ShieldAlert, ArrowRight, Loader2 } from 'lucide-svelte';
	import { page } from '$app/state';

	let { data } = $props();
	let code = $state('');
</script>

<div class="max-w-md mx-auto space-y-8 pt-12">
	<div class="text-center space-y-2">
		<div class="w-16 h-16 bg-slate-900 text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl">
			<Search size={32} />
		</div>
		<h2 class="text-3xl font-black text-slate-800 pt-4">Buscar Diária</h2>
		<p class="text-slate-500 font-medium">Digite o código de 6 dígitos enviado pelo servidor</p>
	</div>

	{#if data.error}
		<div class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
			<ShieldAlert size={20} />
			<p class="text-sm font-bold">{data.error}</p>
		</div>
	{/if}

	<form class="space-y-4" action="/admin/diarias/buscar" method="GET">
		<div class="relative">
			<input 
				type="text" 
				name="code"
				bind:value={code}
				placeholder="Ex: 215444"
				maxlength="6"
				class="w-full pl-6 pr-4 py-6 bg-white border-2 border-slate-100 rounded-[2rem] text-2xl font-mono font-black text-center focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-slate-50 outline-none transition-all shadow-sm"
			/>
		</div>

		<button 
			type="submit"
			disabled={code.length !== 6}
			class="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[2rem] font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
		>
			Localizar Processo
			<ArrowRight size={20} />
		</button>
	</form>

	<div class="pt-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
		Sistema de Gestão de Diárias • Prefeitura Municipal
	</div>
</div>
