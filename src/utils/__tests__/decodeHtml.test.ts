import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeHtmlEntities,
  parseInstagramOembedTitle,
  isBadMindFetchedTitle,
  extractTweetTextFromHtml,
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
    assert.equal(isBadMindFetchedTitle('X.com website error due to privacy extensions'), true);
    assert.equal(isBadMindFetchedTitle('Something went wrong'), true);
    assert.equal(isBadMindFetchedTitle('Attention Required! | Cloudflare'), true);
  });

  it('extractTweetTextFromHtml extracts and decodes tweet text from oembed html', () => {
    const html = '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">This is a tweet with &quot;quotes&quot; and <a href="https://t.co">links</a>.</p>&mdash; User (@user) <a href="status">date</a></blockquote>';
    const text = extractTweetTextFromHtml(html);
    assert.equal(text, 'This is a tweet with "quotes" and links.');
  });
});
