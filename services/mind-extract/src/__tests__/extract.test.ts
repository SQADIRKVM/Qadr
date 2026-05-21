import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { articleTextFromHtml } from '../extract.js';

describe('extract', () => {
  it('articleTextFromHtml extracts readable text from HTML', () => {
    const html = `<!DOCTYPE html><html><head><title>T</title></head><body>
      <article><h1>Delimitation Bill 2026</h1>
      <p>Parliamentary delimitation redraws constituency boundaries in India.</p>
      <p>Second paragraph with more policy detail.</p></article></body></html>`;
    const text = articleTextFromHtml(html, 'https://example.com/article');
    assert.ok(text?.includes('delimitation'));
    assert.ok(text?.includes('India'));
  });
});
