<script lang="ts">
	import { Search, Filter, CheckCircle2, XCircle, AlertCircle, Eye, ShieldCheck, FileText } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data } = $props();

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
</script>

<div class="space-y-8">
	<header>
		<div class="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2 uppercase tracking-widest">
			<ShieldCheck size={16} />
			Painel Administrativo
		</div>
		<h2 class="text-3xl font-black text-slate-800">Gerenciar Diárias</h2>
		<p class="text-slate-500">Analise solicitações e homologue prestações de contas do município.</p>
	</header>

	<!-- Stats Quick View -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
			<div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
				<AlertCircle size={24} />
			</div>
			<div>
				<p class="text-2xl font-black text-slate-800">{data.requests.filter(r => r.request.status === 'pendente').length}</p>
				<p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Aguardando Solicitação</p>
			</div>
		</div>
		<div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
			<div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
				<FileText size={24} />
			</div>
			<div>
				<p class="text-2xl font-black text-slate-800">{data.requests.filter(r => r.report && r.report.status === 'pendente').length}</p>
				<p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Aguardando Homologação</p>
			</div>
		</div>
		<div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
			<div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
				<CheckCircle2 size={24} />
			</div>
			<div>
				<p class="text-2xl font-black text-slate-800">{data.requests.filter(r => r.request.status === 'aprovada' && (!r.report || r.report.status === 'aprovada')).length}</p>
				<p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Processos Concluídos</p>
			</div>
		</div>
	</div>

	<!-- Main List -->
	<div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
		<div class="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/30">
			<div class="relative w-full md:w-96">
				<Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
				<input 
					type="text" 
					placeholder="Buscar por servidor ou destino..."
					class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
				/>
			</div>
			<div class="flex gap-3 w-full md:w-auto">
				<button class="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
					<Filter size={18} />
					Filtros
				</button>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
						<th class="px-6 py-4">Servidor</th>
						<th class="px-6 py-4">Destino / Período</th>
						<th class="px-6 py-4">Valor</th>
						<th class="px-6 py-4">Status Solicitação</th>
						<th class="px-6 py-4">Prestação de Contas</th>
						<th class="px-6 py-4 text-right">Ações</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-50">
					{#each data.requests as { request, user, report }}
						{@const status = getStatusConfig(request.status)}
						<tr class="hover:bg-slate-50/50 transition-colors group">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
										{user.name.charAt(0)}
									</div>
									<div>
										<p class="text-sm font-bold text-slate-700">{user.name}</p>
										<p class="text-[10px] text-slate-400 font-bold tracking-tighter">{user.cpf || 'CPF NÃO INFORMADO'}</p>
									</div>
								</div>
							</td>
							<td class="px-6 py-4">
								<p class="text-sm font-bold text-slate-700">{request.destinoCidadeUf}</p>
								<p class="text-[10px] text-slate-400 font-medium">
									{new Date(request.dataSaida).toLocaleDateString('pt-BR')} - {new Date(request.dataRetorno).toLocaleDateString('pt-BR')}
								</p>
							</td>
							<td class="px-6 py-4">
								<p class="text-sm font-black text-blue-600 font-mono">
									R$ {request.valorTotalSolicitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
								</p>
							</td>
							<td class="px-6 py-4">
								<span class={cn("px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1.5 w-fit", status.color)}>
									<status.icon size={12} />
									{status.label}
								</span>
							</td>
							<td class="px-6 py-4">
								{#if report}
									{@const reportStatus = getStatusConfig(report.status)}
									<span class={cn("px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1.5 w-fit", reportStatus.color)}>
										<reportStatus.icon size={12} />
										{reportStatus.label}
									</span>
								{:else if request.status === 'aprovada'}
									<span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Aguardando Envio</span>
								{:else}
									<span class="text-[10px] font-bold text-slate-200 uppercase tracking-widest">—</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex justify-end gap-2">
									<a 
										href="/admin/diarias/{request.id}" 
										class="p-2 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
										title="Visualizar Detalhes"
									>
										<Eye size={18} />
									</a>
									{#if request.status === 'pendente'}
										<button 
											class="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
											title="Aprovar Solicitação"
										>
											<CheckCircle2 size={18} />
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
