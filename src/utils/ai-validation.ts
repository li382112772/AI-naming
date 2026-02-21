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

    // Remove markdown code blocks if present (handles ```json, ```JSON, ``` json, etc.)
    const codeBlockMatch = cleanString.match(/```\s*(?:json)?\s*\n?([\s\S]*?)\n?\s*```/i);
    if (codeBlockMatch) {
      cleanString = codeBlockMatch[1].trim();
    }

    // 2. Parse JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanString);
    } catch (e) {
      // Last resort: try to extract JSON array or object from the string
      const jsonMatch = cleanString.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          parsedJson = JSON.parse(jsonMatch[1]);
        } catch {
          throw new AIValidationError(
            `Failed to parse JSON from AI response: ${cleanString.slice(0, 200)}`,
            e,
          );
        }
      } else {
        throw new AIValidationError(
          `Failed to parse JSON from AI response: ${cleanString.slice(0, 200)}`,
          e,
        );
      }
    }

    // 3. If schema expects an array but we got an object, try to unwrap it
    //    (DeepSeek json_object mode always returns an object, so arrays get wrapped)
    const dataToValidate = parsedJson;
    if (!Array.isArray(parsedJson) && typeof parsedJson === 'object' && parsedJson !== null) {
      const values = Object.values(parsedJson);
      if (values.length === 1 && Array.isArray(values[0])) {
        // Try the unwrapped array first; fall back to original if it doesn't validate
        const unwrapped = schema.safeParse(values[0]);
        if (unwrapped.success) {
          return unwrapped.data;
        }
      }
    }

    // 4. Validate against schema
    const validationResult = schema.safeParse(dataToValidate);

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
