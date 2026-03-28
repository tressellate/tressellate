import type { Lesson } from '../types';
import { hederaPrimitives, guardian } from './core';
import { cropCert } from './crop-cert';
import { lease } from './lease';
import { partsProv } from './parts-prov';
import { rec } from './rec';
import { drugCert } from './drug-cert';

/** Core lessons first, then domain lessons. */
export const lessons: Lesson[] = [
	hederaPrimitives,
	guardian,
	cropCert,
	lease,
	partsProv,
	rec,
	drugCert
];

export const coreLessons = lessons.filter((l) => l.category === 'core');
export const domainLessons = lessons.filter((l) => l.category === 'domain');

export const lessonsBySlug: Record<string, Lesson> = Object.fromEntries(
	lessons.map((l) => [l.slug, l])
);

export function getLesson(slug: string): Lesson | undefined {
	return lessonsBySlug[slug];
}

export function getAdjacentLessons(slug: string): { prev?: Lesson; next?: Lesson } {
	const idx = lessons.findIndex((l) => l.slug === slug);
	return {
		prev: idx > 0 ? lessons[idx - 1] : undefined,
		next: idx < lessons.length - 1 ? lessons[idx + 1] : undefined
	};
}
