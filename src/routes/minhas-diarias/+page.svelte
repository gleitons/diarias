<script lang="ts">
	import { MapPin, Calendar, Clock, ArrowRight, CheckCircle2, XCircle, AlertCircle, FileEdit, FileDown, Copy, Check, ClipboardList, Search } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data } = $props();
	let copiedId = $state<number | null>(null);
	let searchQuery = $state('');
	let statusFilter = $state('');

	let filteredRequests = $derived(
		data.requests.filter(({ request, report }: any) => {
			const queryMatch = () => {
				if (!searchQuery) return true;
				const query = searchQuery.toLowerCase();
				const dataSaida = new Date(request.dataSaida).toLocaleDateString('pt-BR');
				const dataRetorno = new Date(request.dataRetorno).toLocaleDateString('pt-BR');
				
				return (
					request.id.toString().includes(query) ||
					request.code?.toLowerCase().includes(query) ||
					request.destinoCidadeUf.toLowerCase().includes(query) ||
					request.objetivoViagem.toLowerCase().includes(query) ||
					request.tipoDiaria.toLowerCase().includes(query) ||
					dataSaida.includes(query) ||
					dataRetorno.includes(query) ||
					(report?.relatorioDetalhado?.toLowerCase().includes(query) || false)
				);
			};

			const statusMatch = () => {
				if (!statusFilter) return true;
				return request.status === statusFilter;
			};

			return queryMatch() && statusMatch();
		})
	);

	function copyShareLink(request: any) {
		const url = `${window.location.origin}/admin/diarias/buscar?code=${request.code}`;
		navigator.clipboard.writeText(url);
		copiedId = request.id;
		setTimeout(() => copiedId = null, 2000);
	}

	function getStatusConfig(status: string) {
		switch (status) {
			case 'aprovada':
				return { label: 'Aprovada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
			case 'rejeitada':
				return { label: 'Rejeitada', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
			default:
				return { label: 'Pendente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle };
		}
	}

	function handleStatusChange(e: Event) {
		const status = (e.target as HTMLSelectElement).value;
		statusFilter = status;
	}
</script>

<div class="space-y-6">
	<header class="flex justify-between items-end">
		<div>
			<h2 class="text-2xl font-bold text-slate-800">Minhas Diárias</h2>
			<p class="text-slate-500">Acompanhe o status de suas solicitações e realize a prestação de contas.</p>
		</div>
		<a href="/solicitar" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2">
			Nova Solicitação
		</a>
	</header>

	<div class="relative group flex">
		<Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
		<input 
			type="text" 
			bind:value={searchQuery}
			placeholder="Pesquisar por ID, código, cidade, data, objetivo ou tipo..."
			class="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
		/>
		<div class="ml-4">
			<select onchange={handleStatusChange} class="w-full bg-white border border-slate-200 rounded-2xl py-4 px-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm">
				<option value="">Todos</option>
				<option value="aprovada">Aprovada</option>
				<option value="rejeitada">Rejeitada</option>
				<option value="pendente">Pendente</option>
			</select>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4">
		{#each filteredRequests as { request, report }}
			{@const statusConfig = getStatusConfig(request.status)}
			<div class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col md:flex-row gap-6 items-center">
				<div class="flex-1 min-w-0 space-y-4">
					<div class="flex items-center gap-3">
						<span class={cn("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5", statusConfig.color)}>
							<statusConfig.icon size={14} />
							{statusConfig.label}
						</span>
						<span class="text-xs font-bold text-slate-400 uppercase tracking-widest">#{request.id} • {request.exercicio}</span>
						<div class="flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-lg">
							<span class="text-[10px] font-black uppercase tracking-tighter text-slate-400">Cód:</span>
							<span class="text-xs font-mono font-black">{request.code || '---'}</span>
							<button 
								onclick={() => copyShareLink(request)}
								class="hover:text-blue-400 transition-colors ml-1"
								title="Copiar Link para Admin"
							>
								{#if copiedId === request.id}
									<Check size={12} class="text-emerald-400" />
								{:else}
									<Copy size={12} />
								{/if}
							</button>
						</div>
					</div>
					
					<div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
								<MapPin size={20} />
							</div>
							<div>
								<p class="text-xs text-slate-400 font-bold uppercase">Destino</p>
								<p class="font-bold text-slate-700">{request.destinoCidadeUf}</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
								<Calendar size={20} />
							</div>
							<div>
								<p class="text-xs text-slate-400 font-bold uppercase">Período</p>
								<p class="font-bold text-slate-700">
									{new Date(request.dataSaida).toLocaleDateString('pt-BR')} - {new Date(request.dataRetorno).toLocaleDateString('pt-BR')}
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
								<Clock size={20} />
							</div>
							<div>
								<p class="text-xs text-slate-400 font-bold uppercase">Diárias</p>
								<p class="font-bold text-slate-700">{request.quantidadeDiarias} {request.quantidadeDiarias === 1 ? 'dia' : 'dias'}</p>
							</div>
						</div>
					</div>

					{#if request.status === 'rejeitada' && request.justificativaRejeicao}
						<div class="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
							<AlertCircle size={18} class="text-red-500 shrink-0 mt-0.5" />
							<div>
								<p class="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Motivo da Rejeição</p>
								<p class="text-sm text-red-700 font-medium italic">"{request.justificativaRejeicao}"</p>
							</div>
						</div>
					{/if}
				</div>

				<div class="shrink-0 grid  gap-3 my-1 w-full md:w-auto">
					<a 
						href="/api/diarias/{request.id}/pdf" 
						target="_blank"
						class="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors border border-slate-100"
					>
						<FileDown size={18} />
						PDF (Solicitação)
					</a>
					{#if report}
						<a 
							href="/api/diarias/{request.id}/pdf?type=anexoIII" 
							target="_blank"
							class="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-100"
						>
							<FileDown size={18} />
							PDF (Relatório)
						</a>
						{#if report.status === 'aprovada'}
							<a 
								href="/api/diarias/{request.id}/pdf?type=anexoIV" 
								target="_blank"
								class="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors border border-emerald-100"
							>
								<FileDown size={18} />
								PDF (Homologação)
							</a>
						{/if}
					{/if}
					{#if request.status === 'pendente'}
						<a 
							href="/solicitar/{request.id}" 
							class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-colors border border-amber-100"
						>
							<FileEdit size={18} />
							Editar
						</a>
					{/if}
					{#if request.status === 'aprovada' && !report}
						<a 
							href="/prestar-contas/{request.id}" 
							class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
						>
							<FileEdit size={18} />
							Prestar Contas
						</a>
					{/if}
					<!-- <button class="p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors">
						<ArrowRight size={20} />
					</button> -->
				</div>
			</div>
		{:else}
			{#if searchQuery && data.requests.length > 0}
				<div class="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center text-center space-y-4">
					<div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm">
						<Search size={32} />
					</div>
					<div>
						<p class="font-bold text-slate-800 text-lg">Nenhum resultado encontrado</p>
						<p class="text-slate-500 max-w-xs">Não encontramos nenhuma diária que coincida com "{searchQuery}".</p>
					</div>
					<button 
						onclick={() => searchQuery = ''}
						class="text-blue-600 font-bold hover:underline"
					>
						Limpar pesquisa
					</button>
				</div>
			{:else}
				<div class="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center text-center space-y-4">
					<div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
						<ClipboardList size={32} />
					</div>
					<div>
						<p class="font-bold text-slate-800 text-lg">Nenhuma diária encontrada</p>
						<p class="text-slate-500 max-w-xs">Você ainda não realizou nenhuma solicitação de diária neste sistema.</p>
					</div>
					<a href="/solicitar" class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
						Começar agora
					</a>
				</div>
			{/if}
		{/each}
	</div>
</div>
