/**
 * Validation utilities for Activity Journal
 * Provides validation functions for activity names, emojis, and timestamps
 * Each function returns a ValidationResult with success status and error message
 */

import type { ValidationResult } from '../types';

/**
 * Validates an activity name string
 * 
 * Rules:
 * - Must not be empty
 * - Must not be whitespace-only
 * - Must be 1-100 characters after trimming
 * - Whitespace is automatically trimmed
 * 
 * @param name - The activity name to validate
 * @returns ValidationResult with valid flag and error message if invalid
 * 
 * @validates Requirements 18.1, 18.2, 18.3, 18.4
 */
export function validateActivityName(name: string): ValidationResult {
  // Trim whitespace for validation
  const trimmed = name.trim();

  // Check for empty or whitespace-only string
  if (!trimmed || trimmed.length === 0) {
    return {
      valid: false,
      error: 'Activity name cannot be empty',
    };
  }

  // Check maximum length
  if (trimmed.length > 100) {
    return {
      valid: false,
      error: 'Activity name must be 100 characters or less',
    };
  }

  // Valid activity name
  return {
    valid: true,
  };
}

/**
 * Validates an emoji string
 * 
 * Rules:
 * - Must be a single valid Unicode emoji character
 * - Rejects multi-character sequences
 * - Rejects non-emoji Unicode characters
 * - Rejects empty strings
 * 
 * @param emoji - The emoji string to validate
 * @returns ValidationResult with valid flag and error message if invalid
 * 
 * @validates Requirements 19.1, 19.2, 19.3
 */
export function validateEmoji(emoji: string): ValidationResult {
  // Check for empty string
  if (!emoji || emoji.length === 0) {
    return {
      valid: false,
      error: 'Emoji cannot be empty',
    };
  }

  // Use a regex to detect if it's a valid single emoji
  // This pattern matches most common emojis and emoji sequences
  // Emoji regex pattern accounts for:
  // - Basic emojis (U+1F300 - U+1F6FF)
  // - Extended emojis and sequences
  // - Skin tone modifiers
  // - Zero-width joiners
  const emojiPattern = /^(\p{Emoji}|\p{Emoji_Component})$/u;

  // Check if the string matches the emoji pattern
  if (!emojiPattern.test(emoji)) {
    return {
      valid: false,
      error: 'Must be a single valid emoji character',
    };
  }

  // Additional check: ensure it's a single character (code point)
  // Using Array.from to properly handle emoji with variable length in UTF-16
  const codePoints = Array.from(emoji);
  if (codePoints.length > 1) {
    return {
      valid: false,
      error: 'Emoji must be a single character',
    };
  }

  // Valid emoji
  return {
    valid: true,
  };
}

/**
 * Validates activity timestamps
 * 
 * Rules:
 * - Both createdAt and updatedAt must be positive integers
 * - updatedAt must be greater than or equal to createdAt
 * - Timestamps represent milliseconds since epoch
 * 
 * @param createdAt - The creation timestamp in milliseconds
 * @param updatedAt - The update timestamp in milliseconds
 * @returns ValidationResult with valid flag and error message if invalid
 * 
 * @validates Requirements 15.5, 15.6, 2.4
 */
export function validateTimestamps(
  createdAt: number,
  updatedAt: number
): ValidationResult {
  // Check that both are numbers
  if (typeof createdAt !== 'number' || typeof updatedAt !== 'number') {
    return {
      valid: false,
      error: 'Timestamps must be numbers',
    };
  }

  // Check that both are integers
  if (!Number.isInteger(createdAt) || !Number.isInteger(updatedAt)) {
    return {
      valid: false,
      error: 'Timestamps must be integers',
    };
  }

  // Check that both are positive
  if (createdAt <= 0 || updatedAt <= 0) {
    return {
      valid: false,
      error: 'Timestamps must be positive integers',
    };
  }

  // Check that updatedAt >= createdAt
  if (updatedAt < createdAt) {
    return {
      valid: false,
      error: 'Updated timestamp cannot be before created timestamp',
    };
  }

  // Valid timestamps
  return {
    valid: true,
  };
}
