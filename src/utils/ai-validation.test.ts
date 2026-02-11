import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateAIResponse, AIValidationError } from './ai-validation';

describe('validateAIResponse', () => {
  const TestSchema = z.object({
    name: z.string(),
    age: z.number(),
    tags: z.array(z.string())
  });

  it('should validate correct JSON string', () => {
    const json = '{"name": "test", "age": 25, "tags": ["a", "b"]}';
    const result = validateAIResponse(json, TestSchema);
    expect(result).toEqual({ name: 'test', age: 25, tags: ['a', 'b'] });
  });

  it('should handle markdown code blocks', () => {
    const json = '```json\n{"name": "test", "age": 25, "tags": ["a", "b"]}\n```';
    const result = validateAIResponse(json, TestSchema);
    expect(result).toEqual({ name: 'test', age: 25, tags: ['a', 'b'] });
  });

  it('should handle markdown code blocks without language specifier', () => {
    const json = '```\n{"name": "test", "age": 25, "tags": ["a", "b"]}\n```';
    const result = validateAIResponse(json, TestSchema);
    expect(result).toEqual({ name: 'test', age: 25, tags: ['a', 'b'] });
  });

  it('should throw error for invalid JSON', () => {
    const json = '{name: "test"}'; // Invalid JSON
    expect(() => validateAIResponse(json, TestSchema)).toThrow(AIValidationError);
    expect(() => validateAIResponse(json, TestSchema)).toThrow(/Failed to parse JSON/);
  });

  it('should throw error for schema mismatch', () => {
    const json = '{"name": "test", "age": "25", "tags": []}'; // age should be number
    expect(() => validateAIResponse(json, TestSchema)).toThrow(AIValidationError);
    expect(() => validateAIResponse(json, TestSchema)).toThrow(/schema/);
  });
});
