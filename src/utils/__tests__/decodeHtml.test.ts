import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeHtmlEntities,
  parseInstagramOembedTitle,
  isBadMindFetchedTitle,
} from '../decodeHtml';

describe('decodeHtml', () => {
  it('decodeHtmlEntities decodes numeric hex entities', () => {
    const raw =
      'Skillage Academy on Instagram: "&#xd26;&#xd43;&#xd36;&#xd4d;&#xd2f;&#xd02; 3 #drishyam3"';
    const decoded = decodeHtmlEntities(raw);
    assert.ok(decoded.includes('3'));
    assert.ok(!decoded.includes('&#xd26;'));
    assert.ok(decoded.includes('#drishyam3') || decoded.includes('drishyam'));
  });

  it('parseInstagramOembedTitle prefers hashtag short title over raw caption', () => {
    const parsed = parseInstagramOembedTitle(
      'Skillage Academy on Instagram: "&#xd26;&#xd43; clip #drishyam3 #mohanlal"',
      'Skillage Academy',
    );
    assert.ok(parsed);
    assert.equal(parsed!.displayTitle, 'drishyam3 · mohanlal');
    assert.ok(parsed!.caption.includes('#drishyam3'));
    assert.equal(isBadMindFetchedTitle(parsed!.displayTitle), false);
  });

  it('isBadMindFetchedTitle rejects entity blobs and on Instagram prefix', () => {
    assert.equal(isBadMindFetchedTitle('Foo on Instagram: "bar"'), true);
    assert.equal(isBadMindFetchedTitle('&#xd26; test'), true);
    assert.equal(isBadMindFetchedTitle('Drishyam 3 climax'), false);
  });
});
