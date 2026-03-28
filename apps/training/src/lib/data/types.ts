export interface ToolCallSimulation {
	toolName: string;
	description: string;
	exampleArgs: Record<string, unknown>;
	mockResponse: Record<string, unknown>;
}

export interface LessonStep {
	id: string;
	title: string;
	description: string;
	prompt?: string;
	toolCall?: ToolCallSimulation;
	verification?: string;
	note?: string;
	isSetup?: boolean;
	/** Optional group label — renders a section divider when it changes between steps. */
	group?: string;
}

export interface LessonSummaryItem {
	capability: string;
	toolUsed: string;
}

export interface Lesson {
	id: string;
	slug: string;
	title: string;
	domain: string;
	/** Sidebar grouping: 'core' lessons appear first, 'domain' lessons after. */
	category: 'core' | 'domain';
	primitives: string[];
	toolCount: number;
	color: string;
	icon: string;
	description: string;
	steps: LessonStep[];
	summary: LessonSummaryItem[];
}

export interface ChecklistItem {
	id: string;
	label: string;
	description: string;
}

export interface Primitive {
	name: string;
	represents: string;
	example: string;
	hederaType: string;
}
