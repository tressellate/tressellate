import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'tressellate-training-progress';

interface ProgressState {
	completedSteps: Record<string, boolean>;
	verifiedItems: Record<string, boolean>;
	crossCuttingChecks: Record<string, boolean>;
}

function createInitialState(): ProgressState {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch {
				// ignore
			}
		}
	}
	return { completedSteps: {}, verifiedItems: {}, crossCuttingChecks: {} };
}

function createProgressStore() {
	const { subscribe, update } = writable<ProgressState>(createInitialState());

	if (browser) {
		subscribe((state) => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		});
	}

	return {
		subscribe,
		toggleStep(lessonId: string, stepId: string) {
			const key = `${lessonId}:${stepId}`;
			update((s) => {
				s.completedSteps[key] = !s.completedSteps[key];
				return s;
			});
		},
		toggleVerified(lessonId: string, index: number) {
			const key = `${lessonId}:${index}`;
			update((s) => {
				s.verifiedItems[key] = !s.verifiedItems[key];
				return s;
			});
		},
		toggleCrossCutting(id: string) {
			update((s) => {
				s.crossCuttingChecks[id] = !s.crossCuttingChecks[id];
				return s;
			});
		},
		reset() {
			update(() => ({ completedSteps: {}, verifiedItems: {}, crossCuttingChecks: {} }));
		},
		getCompletionPercent(state: ProgressState, lessonId: string, totalSteps: number): number {
			if (totalSteps === 0) return 0;
			const completed = Object.entries(state.completedSteps)
				.filter(([k, v]) => k.startsWith(`${lessonId}:`) && v)
				.length;
			return Math.round((completed / totalSteps) * 100);
		}
	};
}

export const progress = createProgressStore();
