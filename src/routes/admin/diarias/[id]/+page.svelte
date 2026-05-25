<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
		CheckCircle2,
		XCircle,
		FileText,
		Landmark,
		User,
		MapPin,
		Calendar,
		ShieldCheck,
		Send,
		FileDown,
		Check,
		ClipboardCheck,
		Clock,
		AlertCircle
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();
	console.log(data);
	let isProcessing = $state(false);

	let request = $derived(data.item.request);
	let user = $derived(data.item.user);
	let report = $derived(data.item.report);
</script>

<div class="space-y-8 pb-12">
	<div class="flex items-center justify-between">
		<a
			href="/admin/diarias"
			class="flex items-center gap-2 font-bold text-slate-500 transition-colors hover:text-slate-800"
		>
			<ArrowLeft size={20} />
			Voltar para Lista
		</a>
		<div class="flex gap-3">
			<a
				href="/api/diarias/{request.id}/pdf"
				target="_blank"
				class="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-600 transition-all hover:bg-slate-200"
			>
				<FileDown size={18} />
				PDF Solicitação
			</a>
			{#if report}
				<a
					href="/api/diarias/{request.id}/pdf?type=anexoIII"
					target="_blank"
					class="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-600 transition-all hover:bg-slate-200"
				>
					<FileDown size={18} />
					PDF Relatório
				</a>
				<a
					href="/api/diarias/{request.id}/pdf?type=anexoIV"
					target="_blank"
					class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
				>
					<FileDown size={18} />
					PDF Homologação
				</a>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Detalhes do Pedido -->
		<div class="space-y-8 lg:col-span-2">
			<section class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
				<div class="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 p-8">
					<div class="flex items-center gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white"
						>
							<FileText size={24} />
						</div>
						<div>
							<h3 class="text-xl font-black text-slate-800">Solicitação #{request.code}</h3>
							<p class="text-xs font-bold tracking-widest text-slate-500 uppercase">
								{request.exercicio} • Diárias {request.tipoDiaria}
							</p>
						</div>
					</div>
					<div class="text-right">
						<p class="mb-1 text-xs font-bold text-slate-400 uppercase">Status Atual</p>
						<span
							class={cn(
								'rounded-full border px-4 py-1.5 text-xs font-black tracking-widest uppercase',
								request.status === 'aprovada'
									? 'border-emerald-200 bg-emerald-50 text-emerald-700'
									: request.status === 'rejeitada'
										? 'border-red-200 bg-red-50 text-red-700'
										: 'border-amber-200 bg-amber-50 text-amber-700'
							)}
						>
							{request.status}
						</span>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
					<div class="space-y-6">
						<div class="flex items-start gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400"
							>
								<User size={20} />
							</div>
							<div>
								<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
									Servidor Solicitante
								</p>
								<p class="font-bold text-slate-800">{user.name}</p>
								<p class="text-sm text-slate-500">{user.cargo} • Matrícula: {user.matricula}</p>
								{#if user.phone}
									<p class="mt-1 text-xs font-bold text-blue-600">Tel: {user.phone}</p>
								{/if}
							</div>
						</div>
						<div class="flex items-start gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400"
							>
								<MapPin size={20} />
							</div>
							<div>
								<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
									Destino
								</p>
								<p class="font-bold text-slate-800">{request.destinoCidadeUf}</p>
								<p class="text-sm text-slate-500">{request.objetivoViagem}</p>
							</div>
						</div>
					</div>

					<div class="space-y-6">
						<div class="flex items-start gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400"
							>
								<Calendar size={20} />
							</div>
							<div>
								<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
									Período
								</p>
								<p class="font-bold text-slate-800">
									{new Date(request.dataSaida).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a {new Date(
										request.dataRetorno
									).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
								</p>
								<p class="text-sm text-slate-500">
									{request.quantidadeDiarias} diária(s) solicitada(s)
								</p>
							</div>
						</div>
						<div class="flex items-start gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400"
							>
								<Landmark size={20} />
							</div>
							<div>
								<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
									Valor Total
								</p>
								<p class="font-mono text-2xl font-black text-blue-600">
									R$ {request.valorTotalSolicitado.toLocaleString('pt-BR', {
										minimumFractionDigits: 2
									})}
								</p>
							</div>
						</div>
						<a
							href="/api/diarias/{request.id}/pdf"
							target="_blank"
							class="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-600 transition-all hover:bg-slate-200"
						>
							<FileDown size={18} />
							PDF Solicitação
						</a>
					</div>
				</div>

				{#if request.status === 'pendente'}
					<div class="flex flex-col gap-6 border-t border-slate-100 bg-slate-50 p-8">
						<div class="space-y-3">
							<label 
								for="justificativaRejeicao" 
								class="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
							>
								<AlertCircle size={14} class="text-amber-500" />
								Motivo da Rejeição (Caso deseje rejeitar)
							</label>
							<textarea 
								id="justificativaRejeicao"
								name="justificativaRejeicao"
								form="reject-form"
								rows="3"
								required
								placeholder="Explique por que esta solicitação está sendo rejeitada. Esta mensagem será exibida para o servidor para que ele possa realizar as correções necessárias."
								class="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none shadow-inner bg-white"
							></textarea>
						</div>

						<div class="flex gap-4">
							<form
								method="POST"
								action="?/approveRequest"
								use:enhance={() => {
									isProcessing = true;
									return async ({ update }) => {
										isProcessing = false;
										update();
									};
								}}
								class="flex-1"
							>
								<button
									disabled={isProcessing}
									class="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:opacity-50"
								>
									<CheckCircle2 size={20} />
									Aprovar Solicitação
								</button>
							</form>
							<form
								id="reject-form"
								method="POST"
								action="?/rejectRequest"
								use:enhance={() => {
									isProcessing = true;
									return async ({ update }) => {
										isProcessing = false;
										update();
									};
								}}
								class="flex-1"
							>
								<button
									disabled={isProcessing}
									class="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white py-4 font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
								>
									<XCircle size={20} />
									Rejeitar Pedido
								</button>
							</form>
						</div>
					</div>
				{:else if request.status === 'rejeitada' && request.justificativaRejeicao}
					<div class="border-t border-red-100 bg-red-50/50 p-8">
						<div class="flex items-start gap-3">
							<div class="mt-1 text-red-600">
								<XCircle size={20} />
							</div>
							<div class="space-y-1">
								<p class="text-xs font-black tracking-widest text-red-400 uppercase">Motivo da Rejeição</p>
								<p class="text-sm font-medium text-red-700 leading-relaxed italic">
									"{request.justificativaRejeicao}"
								</p>
							</div>
						</div>
					</div>
				{/if}
			</section>

			{#if report}
				<!-- Prestação de Contas Detalhada -->
				<section class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
					<div class="flex items-center gap-3 border-b border-slate-50 bg-emerald-50/30 p-8">
						<ClipboardCheck class="text-emerald-600" size={24} />
						<h3 class="text-xl font-black text-slate-800">Prestação de Contas Recebida</h3>
					</div>
					<div class="space-y-6 p-8">
						<div class="rounded-2xl border border-slate-100 bg-slate-50 p-6">
							<p class="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
								Relatório Pormenorizado
							</p>
							<p class="leading-relaxed whitespace-pre-wrap text-slate-700">
								{report.relatorioDetalhado}
							</p>
						</div>
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div>
								<p class="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
									Checklist de Documentos
								</p>
								<div class="space-y-3">
									<label
										class="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
									>
										<input
											type="checkbox"
											name="anexoPassagens"
											form="homologate-form"
											checked={report.anexoPassagens}
											class="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
										/>
										<span class="text-sm font-medium text-slate-700">Comprovantes de Passagem</span>
									</label>
									<label
										class="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
									>
										<input
											type="checkbox"
											name="anexoCartoesEmbarque"
											form="homologate-form"
											checked={report.anexoCartoesEmbarque}
											class="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
										/>
										<span class="text-sm font-medium text-slate-700">Cartões de Embarque</span>
									</label>
									<label
										class="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
									>
										<input
											type="checkbox"
											name="anexoAutorizacaoVeiculo"
											form="homologate-form"
											checked={report.anexoAutorizacaoVeiculo}
											class="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
										/>
										<span class="text-sm font-medium text-slate-700">Autorização Veículo</span>
									</label>
								</div>
							</div>
							<div class="text-right">
								<p class="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
									Data original do Relatório
								</p>
								<p class="font-bold text-slate-700">
									{new Date(report.dataRelatorio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
								</p>
							</div>
						</div>
					</div>
				</section>
			{/if}
		</div>

		<!-- Parecer e Homologação -->
		<div class="space-y-6">
			{#if report}
				<section class="sticky top-8 space-y-6 rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
					<div
						class="flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400 uppercase"
					>
						<ShieldCheck size={20} />
						Homologação Final
					</div>

					<form
						id="homologate-form"
						method="POST"
						action="?/homologate"
						use:enhance={() => {
							isProcessing = true;
							return async ({ update }) => {
								isProcessing = false;
								update();
							};
						}}
						class="space-y-6"
					>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="space-y-2">
								<label
									for="dataRelatorio"
									class="text-xs font-bold tracking-wider text-slate-400 uppercase"
									>Data do Relatório</label
								>
								<input
									type="date"
									id="dataRelatorio"
									name="dataRelatorio"
									value={report.dataRelatorio ? new Date(report.dataRelatorio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
									class="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-blue-500 text-white"
									style="color-scheme: dark;"
								/>
							</div>

							<div class="space-y-2">
								<label
									for="contabilidadeData"
									class="text-xs font-bold tracking-wider text-slate-400 uppercase"
									>Data do Parecer</label
								>
								<input
									type="date"
									id="contabilidadeData"
									name="contabilidadeData"
									value={report.contabilidadeData ? new Date(report.contabilidadeData).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
									class="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-blue-500 text-white"
									style="color-scheme: dark;"
								/>
							</div>

							<div class="space-y-2">
								<label
									for="homologacaoData"
									class="text-xs font-bold tracking-wider text-slate-400 uppercase"
									>Data da Homologação</label
								>
								<input
									type="date"
									id="homologacaoData"
									name="homologacaoData"
									value={report.homologacaoData ? new Date(report.homologacaoData).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
									class="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-blue-500 text-white"
									style="color-scheme: dark;"
								/>
							</div>
						</div>

						<div class="space-y-2">
							<label
								for="contabilidadeParecer"
								class="text-xs font-bold tracking-wider text-slate-400 uppercase"
								>Parecer Técnico / Contábil</label
							>
							<textarea
								id="contabilidadeParecer"
								name="contabilidadeParecer"
								rows="4"
								value={report.contabilidadeParecer || ''}
								placeholder="Digite o parecer da contabilidade..."
								class="w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500"
							></textarea>
						</div>

						<div class="space-y-2">
							<label
								for="homologacaoStatus"
								class="text-xs font-bold tracking-wider text-slate-400 uppercase"
								>Decisão do Prefeito</label
							>
							<select
								id="homologacaoStatus"
								name="homologacaoStatus"
								value={report.homologacaoStatus || 'APROVADA'}
								class="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="APROVADA" class="text-slate-900">APROVADA</option>
								<option value="REPROVADA" class="text-slate-900">REPROVADA</option>
							</select>
						</div>

						<button
							type="submit"
							disabled={isProcessing}
							class="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700"
						>
							{#if isProcessing}
								<div
									class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
								></div>
								Salvando...
							{:else}
								<Send size={18} />
								Salvar Homologação
							{/if}
						</button>
					</form>

					<div
						class="border-t border-white/10 pt-4 text-[10px] leading-relaxed font-bold tracking-widest text-slate-500 uppercase"
					>
						Ao salvar, o Anexo IV será gerado com o parecer técnico e a ratificação final do
						prefeito.
					</div>
				</section>
			{:else if request.status === 'aprovada'}
				<div class="space-y-4 rounded-3xl border border-amber-200 bg-amber-50 p-8">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600"
					>
						<Clock size={24} />
					</div>
					<h3 class="font-bold text-amber-800">Aguardando Servidor</h3>
					<p class="text-sm leading-relaxed text-amber-700">
						Esta solicitação já foi aprovada. Agora o servidor precisa realizar a viagem e enviar a
						**Prestação de Contas (Anexo III)** para que você possa homologar o processo.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
