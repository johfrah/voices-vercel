import { describe, expect, it } from 'vitest';
import { shouldElevateVoicyChatForCastingDock } from './VoicyChat';
import { shouldShowCastingDock } from './CastingDock';

describe('chat and casting dock overlap guards', () => {
  it('elevates chat bubble when casting dock can appear', () => {
    expect(shouldElevateVoicyChatForCastingDock(1, false)).toBe(true);
  });

  it('does not elevate chat bubble on excluded pages', () => {
    expect(shouldElevateVoicyChatForCastingDock(2, true)).toBe(false);
  });

  it('shows casting dock only with selection and closed chat', () => {
    expect(shouldShowCastingDock(1, false, false, false)).toBe(true);
    expect(shouldShowCastingDock(1, false, true, false)).toBe(false);
    expect(shouldShowCastingDock(0, false, false, false)).toBe(false);
    expect(shouldShowCastingDock(2, true, false, false)).toBe(false);
    expect(shouldShowCastingDock(2, false, false, true)).toBe(false);
  });
});
