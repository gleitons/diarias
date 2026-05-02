<script lang="ts">
	import { enhance } from '$app/forms';
	import { Users, Key, Shield, User, Mail, Search, Check, AlertCircle, Phone, Fingerprint } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();
	
	let searchQuery = $state('');
	let resettingUserId = $state<string | null>(null);
	let newPassword = $state('');
	let isSaving = $state(false);

	const filteredUsers = $derived(
		data.users.filter(u => 
			u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
			u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			u.cpf?.includes(searchQuery)
		)
	);
</script>

<div class="space-y-8 pb-12">
	<header class="flex justify-between items-end">
		<div>
			<h2 class="text-3xl font-black text-slate-800">Gestão de Usuários</h2>
			<p class="text-slate-500 font-medium">Controle de acessos, papéis e recuperação de senhas.</p>
		</div>
		<div class="relative">
			<Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
			<input 
				type="text" 
				bind:value={searchQuery}
				placeholder="Buscar por nome, email ou CPF..."
				class="w-80 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
			/>
		</div>
	</header>

	{#if form?.success}
		<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
			<Check size={20} />
			<p class="font-bold text-sm">Operação realizada com sucesso!</p>
		</div>
	{/if}

	{#if form?.message && !form.success}
		<div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
			<AlertCircle size={20} />
			<p class="font-bold text-sm">{form.message}</p>
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-4">
		{#each filteredUsers as u}
			<div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all p-6 group">
				<div class="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
					<!-- Info Básica -->
					<div class="flex items-center gap-4 flex-1">
						<div class="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-400">
							{u.name.charAt(0)}
						</div>
						<div class="space-y-1">
							<h3 class="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{u.name}</h3>
							<div class="flex flex-wrap gap-3">
								<div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
									<Mail size={14} />
									{u.email}
								</div>
								{#if u.phone}
									<div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
										<Phone size={14} />
										{u.phone}
									</div>
								{/if}
								<div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
									<Fingerprint size={14} />
									CPF: {u.cpf || '---'}
								</div>
							</div>
						</div>
					</div>

					<!-- Papel e Status -->
					<div class="flex items-center gap-4">
						<form method="POST" action="?/changeRole" use:enhance class="flex items-center gap-2">
							<input type="hidden" name="userId" value={u.id} />
							<div class="relative">
								<select 
									name="role"
									value={u.role}
									onchange={(e) => e.currentTarget.form?.requestSubmit()}
									class={cn(
										"appearance-none pl-10 pr-10 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all outline-none",
										u.role === 'adm_geral' ? "bg-slate-900 border-slate-900 text-white" : 
										u.role === 'adm_diarias' ? "bg-blue-600 border-blue-600 text-white" : 
										"bg-white border-slate-100 text-slate-500 hover:border-slate-300"
									)}
								>
									<option value="solicitante">Solicitante</option>
									<option value="adm_diarias">Adm. Diárias</option>
									<option value="adm_geral">Adm. Geral</option>
								</select>
								<Shield class="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} />
							</div>
						</form>

						<button 
							onclick={() => resettingUserId = u.id}
							class="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
							title="Redefinir Senha"
						>
							<Key size={20} />
						</button>
					</div>
				</div>

				<!-- Password Reset Row (Inline) -->
				{#if resettingUserId === u.id}
					<div class="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
						<form 
							method="POST" 
							action="?/resetPassword" 
							use:enhance={() => {
								isSaving = true;
								return async ({ update }) => {
									isSaving = false;
									resettingUserId = null;
									newPassword = '';
									await update();
								};
							}}
							class="flex flex-col md:flex-row gap-4 items-end"
						>
							<input type="hidden" name="userId" value={u.id} />
							<div class="flex-1 space-y-2">
								<label for="newPassword" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nova Senha para {u.name}</label>
								<div class="relative">
									<Key class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
									<input 
										type="password" 
										name="newPassword"
										bind:value={newPassword}
										required
										placeholder="Digite a nova senha..."
										class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
									/>
								</div>
							</div>
							<div class="flex gap-2">
								<button 
									type="button" 
									onclick={() => resettingUserId = null}
									class="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
								>
									Cancelar
								</button>
								<button 
									type="submit"
									disabled={isSaving || newPassword.length < 6}
									class="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
								>
									{#if isSaving}
										<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									{/if}
									Confirmar Nova Senha
								</button>
							</div>
						</form>
					</div>
				{/if}
			</div>
		{:else}
			<div class="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
				<div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto">
					<Users size={32} />
				</div>
				<p class="font-bold text-slate-800 text-lg">Nenhum usuário encontrado</p>
				<p class="text-slate-500">Tente ajustar sua busca.</p>
			</div>
		{/each}
	</div>
</div>
