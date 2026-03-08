import { describe, test, expect } from 'bun:test';
import { GUARDIAN_TOOLS } from '../index.js';

describe('GUARDIAN_TOOLS', () => {
    test('is an array', () => {
        expect(Array.isArray(GUARDIAN_TOOLS)).toBe(true);
    });

    test('is empty (stub)', () => {
        expect(GUARDIAN_TOOLS).toHaveLength(0);
    });
});
