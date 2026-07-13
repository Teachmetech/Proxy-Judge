import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getSpamhausZone, interpretDnsblAnswers } from '../src/services/blacklist.js';

describe('getSpamhausZone', () => {
  it('uses the public mirror when no DQS key is configured', () => {
    assert.equal(getSpamhausZone(null), 'zen.spamhaus.org');
  });

  it('builds the authenticated DQS zone without exposing it elsewhere', () => {
    assert.equal(
      getSpamhausZone('abcdefghijklmnopqrstuvwxyz'),
      'abcdefghijklmnopqrstuvwxyz.zen.dq.spamhaus.net',
    );
  });

  it('rejects malformed DQS keys instead of silently using a broken zone', () => {
    assert.throws(
      () => getSpamhausZone('not-a-valid-key'),
      /26-character alphanumeric key/,
    );
  });
});

describe('interpretDnsblAnswers', () => {
  const spamhaus = { label: 'Spamhaus ZEN', provider: 'spamhaus' };
  const generic = { label: 'Generic DNSBL' };

  it('does not treat a Spamhaus public-resolver error as a listing', () => {
    assert.deepEqual(
      interpretDnsblAnswers(spamhaus, ['127.255.255.254']),
      {
        listed: false,
        error: 'public_resolver_blocked',
        answers: ['127.255.255.254'],
      },
    );
  });

  it('does not treat Spamhaus rate limiting as a listing', () => {
    assert.deepEqual(
      interpretDnsblAnswers(spamhaus, ['127.255.255.255']),
      {
        listed: false,
        error: 'rate_limited',
        answers: ['127.255.255.255'],
      },
    );
  });

  it('accepts a real Spamhaus reputation response', () => {
    assert.deepEqual(
      interpretDnsblAnswers(spamhaus, ['127.0.0.2', '127.0.0.10']),
      {
        listed: true,
        answers: ['127.0.0.2', '127.0.0.10'],
      },
    );
  });

  it('accepts loopback responses from a conventional DNSBL', () => {
    assert.deepEqual(
      interpretDnsblAnswers(generic, ['127.0.0.2']),
      { listed: true, answers: ['127.0.0.2'] },
    );
  });

  it('rejects unexpected non-loopback DNS answers', () => {
    assert.deepEqual(
      interpretDnsblAnswers(generic, ['192.0.2.10']),
      {
        listed: false,
        error: 'unexpected_answer',
        answers: ['192.0.2.10'],
      },
    );
  });
});
