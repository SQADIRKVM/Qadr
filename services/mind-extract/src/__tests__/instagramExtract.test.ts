import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { collectInstagramImagesFromHtml } from '../extract.js';

describe('instagramExtract', () => {
  it('collectInstagramImagesFromHtml prefers edge_sidecar_to_children block', () => {
    const html = `"edge_sidecar_to_children":{"edges":[
        {"node":{"display_url":"https://cdn.example.com/a.jpg"}},
        {"node":{"display_url":"https://cdn.example.com/b.jpg"}}
      ]}`;
    const images = collectInstagramImagesFromHtml(html);
    assert.equal(images.length, 2);
    assert.ok(images.includes('https://cdn.example.com/a.jpg'));
    assert.ok(images.includes('https://cdn.example.com/b.jpg'));
  });

  it('collectInstagramImagesFromHtml scans full HTML when sidecar has only 2 images', () => {
    const html = `"edge_sidecar_to_children":{"edges":[
        {"node":{"display_url":"https://cdn.example.com/a.jpg"}},
        {"node":{"display_url":"https://cdn.example.com/b.jpg"}}
      ]}
      {"display_url":"https://cdn.example.com/c.jpg"}`;
    const images = collectInstagramImagesFromHtml(html);
    assert.equal(images.length, 3);
    assert.ok(images.includes('https://cdn.example.com/c.jpg'));
  });

  it('collectInstagramImagesFromHtml ignores bare CDN host URLs', () => {
    const html = `"display_url":"https://static.cdninstagram.com"
      {"display_url":"https://cdn.example.com/v/t51/p/abc.jpg?oe=1"}`;
    const images = collectInstagramImagesFromHtml(html);
    assert.equal(images.length, 1);
    assert.ok(images[0].includes('/v/t51/'));
  });

  it('collectInstagramImagesFromHtml finds multiple display_url entries', () => {
    const html = `
      {"display_url":"https://cdn.example.com/a.jpg"}
      {"display_url":"https://cdn.example.com/b.jpg"}
    `;
    const images = collectInstagramImagesFromHtml(html, 'https://cdn.example.com/a.jpg');
    assert.equal(images.length, 2);
    assert.ok(images.includes('https://cdn.example.com/b.jpg'));
  });

  it('collectInstagramImagesFromHtml parses image_versions2 candidates and srcset', () => {
    const html = `
      <img srcset="https://scontent.cdninstagram.com/v/t51/s1.jpg 640w, https://scontent.cdninstagram.com/v/t51/s2.jpg 1080w" />
      "image_versions2":{"candidates":[
        {"url":"https:\\/\\/scontent.cdninstagram.com\\/v\\/t51\\/v1.jpg"},
        {"url":"https:\\/\\/scontent.cdninstagram.com\\/v\\/t51\\/v2.jpg"}
      ]}
    `;
    const images = collectInstagramImagesFromHtml(html);
    assert.ok(images.length >= 3);
    assert.ok(images.some((u) => u.includes('s1.jpg')));
    assert.ok(images.some((u) => u.includes('v2.jpg')));
  });
});
