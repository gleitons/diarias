<script lang="ts">
	import { Calendar, Hash, MapPin, Plus, Share2, Copy, Check } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data } = $props();
	let copiedCode = $state('');

	function copyToClipboard(code: string) {
		navigator.clipboard.writeText(code);
		copiedCode = code;
		setTimeout(() => copiedCode = '', 2000);
	}
</script>

<div class="space-y-6">
	<header class="flex justify-between items-end">
		<div>
			<h2 class="text-2xl font-bold text-slate-800">Meus Eventos</h2>
			<p class="text-slate-500">Gerencie seus eventos e compartilhe os códigos de acesso.</p>
		</div>
		<a href="/eventos/novo" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2">
			<Plus size={18} />
			Novo Evento
		</a>
	</header>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each data.events as event}
			<div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 hover:shadow-xl transition-all group">
				<div class="flex justify-between items-start">
					<div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
						<Calendar size={24} />
					</div>
					<div class="flex flex-col items-end">
						<span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Código</span>
						<button 
							onclick={() => copyToClipboard(event.code)}
							class="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl font-mono font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200"
						>
							{event.code}
							{#if copiedCode === event.code}
								<Check size={16} class="text-emerald-400" />
							{:else}
								<Copy size={16} class="text-slate-500" />
							{/if}
						</button>
					</div>
				</div>

				<div>
					<h3 class="font-black text-slate-800 text-xl leading-tight mb-2 group-hover:text-blue-600 transition-colors">{event.name}</h3>
					<div class="flex items-center gap-2 text-slate-500 text-sm">
						<MapPin size={16} />
						{event.city} - {event.state}
					</div>
				</div>

				<div class="pt-4 border-t border-slate-50 flex justify-between items-center">
					<div class="text-xs font-bold text-slate-400">
						{event.distance} KM (Ida)
					</div>
					<button class="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
						<Share2 size={14} />
						Compartilhar
					</button>
				</div>
			</div>
		{:else}
			<div class="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
				<div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto">
					<Calendar size={32} />
				</div>
				<p class="font-bold text-slate-800 text-lg">Nenhum evento cadastrado</p>
				<p class="text-slate-500 max-w-xs mx-auto">Crie eventos para que outros servidores possam carregar as informações automaticamente.</p>
				<a href="/eventos/novo" class="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
					Cadastrar Primeiro Evento
				</a>
			</div>
		{/each}
	</div>
</div>
