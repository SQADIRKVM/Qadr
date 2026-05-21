import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { collectImagesFromHtml } from '../extract.js';

describe('collectImagesFromHtml', () => {
  it('collects multiple og:image tags', () => {
    const html = `
      <html><head>
        <meta property="og:image" content="https://cdn.example.com/1.jpg" />
        <meta property="og:image" content="https://cdn.example.com/2.jpg" />
      </head></html>`;
    const images = collectImagesFromHtml(html);
    assert.equal(images.length, 2);
    assert.equal(images[0], 'https://cdn.example.com/1.jpg');
  });
});
