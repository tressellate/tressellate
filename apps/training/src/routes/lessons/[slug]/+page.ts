import { error } from '@sveltejs/kit';
import { getLesson, lessons } from '$lib/data/lessons';

export function entries() {
	return lessons.map((l) => ({ slug: l.slug }));
}

export function load({ params }: { params: { slug: string } }) {
	const lesson = getLesson(params.slug);
	if (!lesson) throw error(404, 'Lesson not found');
	return { lesson };
}
