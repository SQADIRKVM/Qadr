import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isInstagramCdnHost, isValidPreviewImageUrl } from '../mindImageHosts';

describe('mindImageUrl', () => {
  it('isInstagramCdnHost accepts common Instagram CDN hosts', () => {
    assert.equal(isInstagramCdnHost('scontent.cdninstagram.com'), true);
    assert.equal(isInstagramCdnHost('instagram.fna.fbcdn.net'), true);
    assert.equal(isInstagramCdnHost('cdninstagram.com'), true);
    assert.equal(isInstagramCdnHost('example.com'), false);
  });

  it('isValidPreviewImageUrl rejects bare CDN roots', () => {
    assert.equal(isValidPreviewImageUrl('https://static.cdninstagram.com'), false);
    assert.equal(
      isValidPreviewImageUrl(
        'https://scontent.cdninstagram.com/v/t51.82787-15/123_n.jpg?stp=dst-jpg&oe=ABC',
      ),
      true,
    );
  });
});
