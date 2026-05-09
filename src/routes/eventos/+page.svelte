<script lang="ts">
	import { Plus, Search, MapPin, Calendar, ArrowRight, Edit, Hash, Copy, Check } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data } = $props();
	let searchQuery = $state('');

	let filteredEvents = $derived(
		data.events.filter((event: any) => {
			const query = searchQuery.toLowerCase();
			return (
				event.name.toLowerCase().includes(query) ||
				event.code.toLowerCase().includes(query) ||
				event.city.toLowerCase().includes(query) ||
				event.state.toLowerCase().includes(query) ||
				(event.description?.toLowerCase().includes(query) || false)
			);
		})
	);

	let copiedCode = $state<string | null>(null);

	function copyCode(code: string) {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(code);
			copiedCode = code;
			setTimeout(() => {
				if (copiedCode === code) copiedCode = null;
			}, 2000);
		}
	}
</script>

<div class="space-y-8 pb-12">
	<header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h2 class="text-3xl font-black text-slate-800">Eventos e Missões</h2>
			<p class="text-slate-500 text-sm">Gerencie eventos frequentes para agilizar novas solicitações.</p>
		</div>
		<a 
			href="/eventos/novo" 
			class="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 shrink-0"
		>
			<Plus size={20} />
			Novo Evento
		</a>
	</header>

	<div class="relative group max-w-2xl">
		<Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
		<input 
			type="text" 
			bind:value={searchQuery}
			placeholder="Pesquisar por nome, código, cidade ou descrição..."
			class="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
		/>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each filteredEvents as event}
			<div class="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group overflow-hidden flex flex-col">
				<div class="p-6 flex-1 space-y-4">
					<div class="flex justify-between items-start gap-4">
						<div class="space-y-1">
							<div class="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
								<Hash size={12} />
								Código: {event.code}
							</div>
							<h3 class="font-black text-slate-800 text-xl leading-tight group-hover:text-blue-600 transition-colors">
								{event.name}
							</h3>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-slate-600 font-medium">
							<MapPin size={16} class="text-slate-400" />
							{event.city} - {event.state}
						</div>
						<div class="flex items-center gap-2 text-sm text-slate-600 font-medium">
							<Calendar size={16} class="text-slate-400" />
							{event.distance} KM (Ida)
						</div>
					</div>

					{#if event.description}
						<p class="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">
							"{event.description}"
						</p>
					{/if}
				</div>

				<div class="p-4 bg-slate-50 border-t border-slate-50 flex gap-2">
					<a 
						href="/eventos/{event.id}" 
						class="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
					>
						<Edit size={16} />
						Editar
					</a>
					<button 
						onclick={() => copyCode(event.code)}
						class="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-mono font-bold hover:bg-slate-800 transition-colors"
						title="Copiar código"
					>
						{event.code}
						{#if copiedCode === event.code}
							<Check size={16} class="text-emerald-400" />
						{:else}
							<Copy size={16} class="opacity-50" />
						{/if}
					</button>
				</div>
			</div>
		{:else}
			{#if searchQuery && data.events.length > 0}
				<div class="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
					<div class="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm">
						<Search size={40} />
					</div>
					<div>
						<p class="text-slate-800 font-bold text-xl">Nenhum evento encontrado</p>
						<p class="text-slate-500 text-sm">Não encontramos nenhum evento que coincida com "{searchQuery}".</p>
					</div>
					<button 
						onclick={() => searchQuery = ''}
						class="text-blue-600 font-bold hover:underline text-sm"
					>
						Limpar pesquisa
					</button>
				</div>
			{:else}
				<div class="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
					<div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
						<Search size={40} />
					</div>
					<div>
						<p class="text-slate-800 font-bold text-xl">Nenhum evento cadastrado</p>
						<p class="text-slate-500 text-sm">Crie eventos para cidades que você visita com frequência.</p>
					</div>
					<a href="/eventos/novo" class="text-blue-600 font-bold hover:underline flex items-center gap-2 text-sm">
						Comece criando seu primeiro evento
						<ArrowRight size={16} />
					</a>
				</div>
			{/if}
		{/each}
	</div>
</div>
