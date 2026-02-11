import { z } from 'zod';

export class AIValidationError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AIValidationError';
  }
}

/**
 * Validates AI response string against a Zod schema
 * Handles cleaning up markdown code blocks if present
 */
export function validateAIResponse<T>(
  responseString: string,
  schema: z.ZodType<T>
): T {
  try {
    // 1. Clean up the string
    let cleanString = responseString.trim();
    
    // Remove markdown code blocks if present
    if (cleanString.startsWith('```')) {
      cleanString = cleanString.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
    }

    // 2. Parse JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanString);
    } catch (e) {
      throw new AIValidationError('Failed to parse JSON from AI response', e);
    }

    // 3. Validate against schema
    const validationResult = schema.safeParse(parsedJson);

    if (!validationResult.success) {
      throw new AIValidationError(
        'AI response does not match the required schema',
        validationResult.error
      );
    }

    return validationResult.data;
  } catch (error) {
    if (error instanceof AIValidationError) {
      throw error;
    }
    throw new AIValidationError('Unknown error during AI validation', error);
  }
}
