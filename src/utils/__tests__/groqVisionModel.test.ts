import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGroqVisionModel } from '../../services/ai/client';

describe('normalizeGroqVisionModel', () => {
  it('adds meta-llama prefix for short scout alias', () => {
    assert.equal(
      normalizeGroqVisionModel('llama-4-scout-17b-16e-instruct'),
      'meta-llama/llama-4-scout-17b-16e-instruct',
    );
  });

  it('keeps full groq model id', () => {
    assert.equal(
      normalizeGroqVisionModel('meta-llama/llama-4-scout-17b-16e-instruct'),
      'meta-llama/llama-4-scout-17b-16e-instruct',
    );
  });

  it('maps decommissioned vision models to scout', () => {
    assert.equal(
      normalizeGroqVisionModel('llama-3.2-90b-vision-preview'),
      'meta-llama/llama-4-scout-17b-16e-instruct',
    );
  });
});
