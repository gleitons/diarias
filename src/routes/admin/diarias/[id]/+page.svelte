<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, CheckCircle2, XCircle, FileText, Landmark, User, MapPin, Calendar, ShieldCheck, Send, FileDown, Check, ClipboardCheck, Clock } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();
	let isProcessing = $state(false);

	let request = $derived(data.item.request);
	let user = $derived(data.item.user);
	let report = $derived(data.item.report);
</script>

<div class="space-y-8 pb-12">
	<div class="flex items-center justify-between">
		<a href="/admin/diarias" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
			<ArrowLeft size={20} />
			Voltar para Lista
		</a>
		<div class="flex gap-3">
			<a href="/api/diarias/{request.id}/pdf" target="_blank" class="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
				<FileDown size={18} />
				PDF Solicitação
			</a>
			{#if report}
				<a href="/api/diarias/{request.id}/pdf?type=anexoIII" target="_blank" class="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
					<FileDown size={18} />
					PDF Relatório
				</a>
				<a href="/api/diarias/{request.id}/pdf?type=anexoIV" target="_blank" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
					<FileDown size={18} />
					PDF Homologação
				</a>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Detalhes do Pedido -->
		<div class="lg:col-span-2 space-y-8">
			<section class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
				<div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
							<FileText size={24} />
						</div>
						<div>
							<h3 class="text-xl font-black text-slate-800">Solicitação #{request.id}</h3>
							<p class="text-xs text-slate-500 font-bold uppercase tracking-widest">{request.exercicio} • Diárias {request.tipoDiaria}</p>
						</div>
					</div>
					<div class="text-right">
						<p class="text-xs text-slate-400 font-bold uppercase mb-1">Status Atual</p>
						<span class={cn(
							"px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest",
							request.status === 'aprovada' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
							request.status === 'rejeitada' ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
						)}>
							{request.status}
						</span>
					</div>
				</div>

				<div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
					<div class="space-y-6">
						<div class="flex items-start gap-4">
							<div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
								<User size={20} />
							</div>
							<div>
								<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Servidor Solicitante</p>
								<p class="font-bold text-slate-800">{user.name}</p>
								<p class="text-sm text-slate-500">{user.cargo} • Matrícula: {user.matricula}</p>
								{#if user.phone}
									<p class="text-xs text-blue-600 font-bold mt-1">Tel: {user.phone}</p>
								{/if}
							</div>
						</div>
						<div class="flex items-start gap-4">
							<div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
								<MapPin size={20} />
							</div>
							<div>
								<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Destino</p>
								<p class="font-bold text-slate-800">{request.destinoCidadeUf}</p>
								<p class="text-sm text-slate-500">{request.objetivoViagem}</p>
							</div>
						</div>
					</div>

					<div class="space-y-6">
						<div class="flex items-start gap-4">
							<div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
								<Calendar size={20} />
							</div>
							<div>
								<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Período</p>
								<p class="font-bold text-slate-800">
									{new Date(request.dataSaida).toLocaleDateString('pt-BR')} a {new Date(request.dataRetorno).toLocaleDateString('pt-BR')}
								</p>
								<p class="text-sm text-slate-500">{request.quantidadeDiarias} diária(s) solicitada(s)</p>
							</div>
						</div>
						<div class="flex items-start gap-4">
							<div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
								<Landmark size={20} />
							</div>
							<div>
								<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor Total</p>
								<p class="text-2xl font-black text-blue-600 font-mono">
									R$ {request.valorTotalSolicitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
								</p>
							</div>
						</div>
					</div>
				</div>

				{#if request.status === 'pendente'}
					<div class="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
						<form method="POST" action="?/approveRequest" use:enhance={() => { isProcessing = true; return async ({update}) => { isProcessing = false; update(); } }} class="flex-1">
							<button disabled={isProcessing} class="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
								<CheckCircle2 size={20} />
								Aprovar Solicitação
							</button>
						</form>
						<form method="POST" action="?/rejectRequest" use:enhance={() => { isProcessing = true; return async ({update}) => { isProcessing = false; update(); } }} class="flex-1">
							<button disabled={isProcessing} class="w-full py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2">
								<XCircle size={20} />
								Rejeitar Pedido
							</button>
						</form>
					</div>
				{/if}
			</section>

			{#if report}
				<!-- Prestação de Contas Detalhada -->
				<section class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
					<div class="p-8 border-b border-slate-50 flex items-center gap-3 bg-emerald-50/30">
						<ClipboardCheck class="text-emerald-600" size={24} />
						<h3 class="text-xl font-black text-slate-800">Prestação de Contas Recebida</h3>
					</div>
					<div class="p-8 space-y-6">
						<div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
							<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Relatório Pormenorizado</p>
							<p class="text-slate-700 leading-relaxed whitespace-pre-wrap">{report.relatorioDetalhado}</p>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Checklist de Documentos</p>
								<ul class="space-y-2">
									<li class="flex items-center gap-2 text-sm font-medium text-slate-600">
										<div class={cn("w-4 h-4 rounded border flex items-center justify-center", report.anexoPassagens ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300")}>
											{#if report.anexoPassagens}<Check size={12} strokeWidth={4} />{/if}
										</div>
										Comprovantes de Passagem
									</li>
									<li class="flex items-center gap-2 text-sm font-medium text-slate-600">
										<div class={cn("w-4 h-4 rounded border flex items-center justify-center", report.anexoCartoesEmbarque ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300")}>
											{#if report.anexoCartoesEmbarque}<Check size={12} strokeWidth={4} />{/if}
										</div>
										Cartões de Embarque
									</li>
									<li class="flex items-center gap-2 text-sm font-medium text-slate-600">
										<div class={cn("w-4 h-4 rounded border flex items-center justify-center", report.anexoAutorizacaoVeiculo ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300")}>
											{#if report.anexoAutorizacaoVeiculo}<Check size={12} strokeWidth={4} />{/if}
										</div>
										Autorização Veículo
									</li>
								</ul>
							</div>
							<div class="text-right">
								<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Data do Relatório</p>
								<p class="font-bold text-slate-700">{new Date(report.dataRelatorio).toLocaleDateString('pt-BR')}</p>
							</div>
						</div>
					</div>
				</section>
			{/if}
		</div>

		<!-- Parecer e Homologação -->
		<div class="space-y-6">
			{#if report}
				<section class="bg-slate-900 rounded-3xl shadow-xl p-8 text-white space-y-6 sticky top-8">
					<div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
						<ShieldCheck size={20} />
						Homologação Final
					</div>
					
					<form method="POST" action="?/homologate" use:enhance={() => { isProcessing = true; return async ({update}) => { isProcessing = false; update(); } }} class="space-y-6">
						<div class="space-y-2">
							<label for="contabilidadeParecer" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Parecer Técnico / Contábil</label>
							<textarea 
								id="contabilidadeParecer" name="contabilidadeParecer" 
								rows="4"
								value={report.contabilidadeParecer || ''}
								placeholder="Digite o parecer da contabilidade..."
								class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
							></textarea>
						</div>

						<div class="space-y-2">
							<label for="homologacaoStatus" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Decisão do Prefeito</label>
							<select 
								id="homologacaoStatus" name="homologacaoStatus" 
								value={report.homologacaoStatus || 'APROVADA'}
								class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
							>
								<option value="APROVADA" class="text-slate-900">APROVADA</option>
								<option value="REPROVADA" class="text-slate-900">REPROVADA</option>
							</select>
						</div>

						<button 
							type="submit" 
							disabled={isProcessing}
							class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
						>
							{#if isProcessing}
								<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								Salvando...
							{:else}
								<Send size={18} />
								Salvar Homologação
							{/if}
						</button>
					</form>

					<div class="pt-4 border-t border-white/10 text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
						Ao salvar, o Anexo IV será gerado com o parecer técnico e a ratificação final do prefeito.
					</div>
				</section>
			{:else if request.status === 'aprovada'}
				<div class="bg-amber-50 border border-amber-200 p-8 rounded-3xl space-y-4">
					<div class="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
						<Clock size={24} />
					</div>
					<h3 class="font-bold text-amber-800">Aguardando Servidor</h3>
					<p class="text-sm text-amber-700 leading-relaxed">
						Esta solicitação já foi aprovada. Agora o servidor precisa realizar a viagem e enviar a **Prestação de Contas (Anexo III)** para que você possa homologar o processo.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
