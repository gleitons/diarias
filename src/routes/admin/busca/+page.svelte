<script lang="ts">
	import { Search, Hash, AlertCircle, ArrowRight } from 'lucide-svelte';
	let { data } = $props();
</script>

<div class="max-w-2xl mx-auto py-12 space-y-8">
	<header class="text-center space-y-2">
		<div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200 mb-4">
			<Search size={32} />
		</div>
		<h2 class="text-3xl font-black text-slate-800 tracking-tight">Buscar Solicitação</h2>
		<p class="text-slate-500 font-medium italic">Digite o código de 6 dígitos fornecido pelo servidor</p>
	</header>

	<form method="GET" class="relative group">
		<div class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
			<Hash size={24} />
		</div>
		<input 
			type="text" 
			name="code" 
			placeholder="Ex: 215444"
			maxlength="6"
			required
			class="w-full pl-16 pr-32 py-6 bg-white border-2 border-slate-100 rounded-3xl text-2xl font-mono font-black tracking-[0.2em] focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none shadow-sm transition-all text-slate-700 placeholder:text-slate-200"
		/>
		<button 
			type="submit"
			class="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
		>
			Pesquisar
			<ArrowRight size={18} />
		</button>
	</form>

	{#if data?.error}
		<div class="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
			<div class="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
				<AlertCircle size={24} />
			</div>
			<p class="font-bold text-red-700">{data.error}</p>
		</div>
	{/if}

	<div class="pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
		<div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
			<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Dica de Acesso</p>
			<p class="text-sm text-slate-600 leading-relaxed font-medium">
				O servidor pode encontrar este código na tela <span class="text-blue-600 font-bold">"Minhas Diárias"</span> logo abaixo do status da solicitação.
			</p>
		</div>
		<div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
			<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">O que acontece?</p>
			<p class="text-sm text-slate-600 leading-relaxed font-medium">
				Ao encontrar o código, você será redirecionado automaticamente para a tela de análise e emissão dos anexos.
			</p>
		</div>
	</div>
</div>
