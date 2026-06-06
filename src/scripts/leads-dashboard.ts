import { createClient } from '@supabase/supabase-js';
import { LEADS_QUERY, type Lead } from '../lib/supabase';

type ScoreTier = 'all' | 'high' | 'medium' | 'low';

interface DashboardConfig {
	initialLeads: Lead[];
	initialError: string | null;
	supabaseUrl: string;
	supabaseAnonKey: string;
}

function escapeHtml(str: string): string {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function scoreBadgeClass(score: number): string {
	if (score >= 80) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
	if (score >= 50) return 'bg-amber-50 text-amber-700 ring-amber-600/20';
	return 'bg-red-50 text-red-700 ring-red-600/20';
}

function scoreLabel(score: number): string {
	if (score >= 80) return 'Alta';
	if (score >= 50) return 'Média';
	return 'Baixa';
}

function matchesScoreTier(score: number, tier: ScoreTier): boolean {
	if (tier === 'all') return true;
	if (tier === 'high') return score >= 80;
	if (tier === 'medium') return score >= 50 && score <= 79;
	return score < 50;
}

function instagramCell(instagram: string | null): string {
	if (!instagram) return '<span class="text-slate-400">—</span>';

	const href = escapeHtml(instagram);
	return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800">
		<svg class="h-4 w-4 shrink-0 text-pink-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
		</svg>
		Abrir perfil
	</a>`;
}

function actionsCell(lead: Lead): string {
	const instagramBtn = lead.instagram
		? `<a href="${escapeHtml(lead.instagram)}" target="_blank" rel="noopener noreferrer" title="Abrir Instagram" class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-pink-600">
			<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
		</a>`
		: `<span class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-slate-200 text-slate-300" title="Sem Instagram">
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"/></svg>
		</span>`;

	return `<div class="flex items-center gap-1.5">
		${instagramBtn}
		<button type="button" data-copy-lead="${lead.id}" title="Copiar dados do lead" class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-indigo-600">
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/></svg>
		</button>
	</div>`;
}

function renderRow(lead: Lead): string {
	const badge = scoreBadgeClass(lead.lead_score);
	const label = scoreLabel(lead.lead_score);

	return `<tr class="group transition-colors hover:bg-slate-50/80">
		<td class="px-4 py-4 font-medium text-slate-900 sm:px-6">${escapeHtml(lead.razao_social)}</td>
		<td class="px-4 py-4 sm:px-6">
			<span class="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">${escapeHtml(lead.cnae)}</span>
		</td>
		<td class="px-4 py-4 sm:px-6">${instagramCell(lead.instagram)}</td>
		<td class="px-4 py-4 sm:px-6">
			<span class="inline-flex items-center gap-2">
				<span class="inline-flex min-w-[2.75rem] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${badge}">${lead.lead_score}</span>
				<span class="text-xs font-medium text-slate-400">${label}</span>
			</span>
		</td>
		<td class="max-w-[16rem] truncate px-4 py-4 text-slate-600 sm:max-w-xs sm:px-6" title="${escapeHtml(lead.justificativa_ia ?? '')}">${escapeHtml(lead.justificativa_ia ?? '—')}</td>
		<td class="px-4 py-4 sm:px-6">${actionsCell(lead)}</td>
	</tr>`;
}

function loadingRows(): string {
	return Array.from({ length: 4 })
		.map(
			() => `<tr class="animate-pulse">
			<td class="px-6 py-4"><div class="h-4 w-40 rounded bg-slate-200"></div></td>
			<td class="px-6 py-4"><div class="h-4 w-20 rounded bg-slate-200"></div></td>
			<td class="px-6 py-4"><div class="h-4 w-24 rounded bg-slate-200"></div></td>
			<td class="px-6 py-4"><div class="h-6 w-14 rounded-full bg-slate-200"></div></td>
			<td class="px-6 py-4"><div class="h-4 w-48 rounded bg-slate-200"></div></td>
			<td class="px-6 py-4"><div class="h-8 w-20 rounded bg-slate-200"></div></td>
		</tr>`,
		)
		.join('');
}

function emptyRow(message: string): string {
	return `<tr>
		<td colspan="6" class="px-6 py-16 text-center">
			<div class="mx-auto flex max-w-sm flex-col items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
					<svg class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
					</svg>
				</div>
				<p class="text-sm font-medium text-slate-700">${escapeHtml(message)}</p>
				<p class="text-xs text-slate-400">Tente ajustar os filtros ou atualizar os dados.</p>
			</div>
		</td>
	</tr>`;
}

export function initLeadsDashboard({
	initialLeads,
	initialError,
	supabaseUrl,
	supabaseAnonKey,
}: DashboardConfig): void {
	let allLeads: Lead[] = initialLeads;

	const tbody = document.getElementById('leads-tbody');
	const leadCount = document.getElementById('lead-count');
	const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
	const scoreFilter = document.getElementById('score-filter') as HTMLSelectElement | null;
	const cnaeFilter = document.getElementById('cnae-filter') as HTMLSelectElement | null;
	const refreshBtn = document.getElementById('refresh-btn') as HTMLButtonElement | null;
	const refreshIcon = document.getElementById('refresh-icon');
	const refreshLabel = document.getElementById('refresh-label');
	const errorBanner = document.getElementById('error-banner');
	const errorMessage = document.getElementById('error-message');
	const tableWrapper = document.getElementById('table-wrapper');

	const supabase =
		supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

	function setLoading(loading: boolean): void {
		if (!tbody) return;
		if (loading) {
			tbody.innerHTML = loadingRows();
			tableWrapper?.classList.add('pointer-events-none', 'opacity-60');
		} else {
			tableWrapper?.classList.remove('pointer-events-none', 'opacity-60');
		}
	}

	function setRefreshLoading(loading: boolean): void {
		refreshBtn?.toggleAttribute('disabled', loading);
		refreshIcon?.classList.toggle('animate-spin', loading);
		if (refreshLabel) refreshLabel.textContent = loading ? 'Atualizando...' : 'Atualizar Dados';
	}

	function showError(msg: string): void {
		if (!errorBanner || !errorMessage) return;
		errorMessage.textContent = msg;
		errorBanner.classList.remove('hidden');
	}

	function hideError(): void {
		errorBanner?.classList.add('hidden');
	}

	function getFilteredLeads(): Lead[] {
		const search = searchInput?.value.trim().toLowerCase() ?? '';
		const score = (scoreFilter?.value ?? 'all') as ScoreTier;
		const cnae = cnaeFilter?.value ?? 'all';

		return allLeads.filter((lead) => {
			if (search && !lead.razao_social.toLowerCase().includes(search)) return false;
			if (cnae !== 'all' && lead.cnae !== cnae) return false;
			if (!matchesScoreTier(lead.lead_score, score)) return false;
			return true;
		});
	}

	function updateCnaeOptions(): void {
		if (!cnaeFilter) return;
		const current = cnaeFilter.value;
		const unique = [...new Set(allLeads.map((l) => l.cnae).filter(Boolean))].sort();

		cnaeFilter.innerHTML = '<option value="all">Todos os CNAEs</option>';
		for (const c of unique) {
			const opt = document.createElement('option');
			opt.value = c;
			opt.textContent = c;
			cnaeFilter.appendChild(opt);
		}
		if (unique.includes(current)) cnaeFilter.value = current;
	}

	function updateCount(filtered: Lead[]): void {
		if (leadCount) leadCount.textContent = `${filtered.length} leads qualificados`;
	}

	function attachCopyHandlers(): void {
		tbody?.querySelectorAll('[data-copy-lead]').forEach((btn) => {
			btn.addEventListener('click', async () => {
				const id = Number((btn as HTMLElement).dataset.copyLead);
				const lead = allLeads.find((l) => l.id === id);
				if (!lead) return;

				const text = [
					`Razão Social: ${lead.razao_social}`,
					`CNAE: ${lead.cnae}`,
					`Lead Score: ${lead.lead_score}`,
					`Instagram: ${lead.instagram ?? 'N/A'}`,
					`Justificativa IA: ${lead.justificativa_ia ?? 'N/A'}`,
				].join('\n');

				await navigator.clipboard.writeText(text);
				const el = btn as HTMLButtonElement;
				el.title = 'Copiado!';
				setTimeout(() => {
					el.title = 'Copiar dados do lead';
				}, 2000);
			});
		});
	}

	function renderTable(): void {
		if (!tbody) return;

		const filtered = getFilteredLeads();
		updateCount(filtered);

		if (allLeads.length === 0) {
			tbody.innerHTML = emptyRow('Nenhum lead encontrado');
			return;
		}

		if (filtered.length === 0) {
			tbody.innerHTML = emptyRow('Nenhum lead corresponde aos filtros');
			return;
		}

		tbody.innerHTML = filtered.map(renderRow).join('');
		attachCopyHandlers();
	}

	async function refreshLeads(): Promise<void> {
		if (!supabase) {
			showError('Configure PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY no arquivo .env');
			return;
		}

		hideError();
		setRefreshLoading(true);
		setLoading(true);

		const { data, error } = await supabase
			.from('leads')
			.select(LEADS_QUERY)
			.order('lead_score', { ascending: false });

		setRefreshLoading(false);
		setLoading(false);

		if (error) {
			showError(`Não foi possível conectar ao Supabase. Verifique sua conexão e tente novamente. (${error.message})`);
			renderTable();
			return;
		}

		allLeads = (data ?? []) as Lead[];
		updateCnaeOptions();
		renderTable();
	}

	searchInput?.addEventListener('input', renderTable);
	scoreFilter?.addEventListener('change', renderTable);
	cnaeFilter?.addEventListener('change', renderTable);
	refreshBtn?.addEventListener('click', refreshLeads);

	if (initialError) showError(initialError);

	// Brief loading skeleton for polish, then render SSR data
	setLoading(true);
	requestAnimationFrame(() => {
		updateCnaeOptions();
		renderTable();
		setLoading(false);
	});
}
