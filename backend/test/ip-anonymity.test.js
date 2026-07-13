import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isPrivateIP, normalizeIP, firstPublicIPFromHeader } from '../src/utils/ip.js';
import { detectProxyAnonymity } from '../src/services/anonymity.js';

describe('normalizeIP', () => {
  it('strips IPv6-mapped prefix', () => {
    assert.equal(normalizeIP('::ffff:203.0.113.10'), '203.0.113.10');
  });

  it('strips brackets', () => {
    assert.equal(normalizeIP('[2001:db8::1]'), '2001:db8::1');
  });
});

describe('isPrivateIP', () => {
  it('detects loopback and RFC1918', () => {
    assert.equal(isPrivateIP('127.0.0.1'), true);
    assert.equal(isPrivateIP('10.0.0.5'), true);
    assert.equal(isPrivateIP('192.168.1.1'), true);
    assert.equal(isPrivateIP('172.16.0.1'), true);
    assert.equal(isPrivateIP('8.8.8.8'), false);
  });
});

describe('firstPublicIPFromHeader', () => {
  it('returns first public IP from XFF list', () => {
    assert.equal(firstPublicIPFromHeader('203.0.113.1, 10.0.0.1'), '203.0.113.1');
  });
});

describe('detectProxyAnonymity', () => {
  const connecting = '203.0.113.50';

  it('classifies elite when no proxy headers', () => {
    const req = { headers: { host: 'api.proxy-judge.com', 'user-agent': 'curl/8' } };
    const result = detectProxyAnonymity(req, connecting);
    assert.equal(result.level, 'ELITE');
    assert.equal(result.originalClientIP, null);
  });

  it('ignores infra X-Real-IP matching connecting IP', () => {
    const req = {
      headers: {
        'x-real-ip': connecting,
        host: 'api.proxy-judge.com',
      },
    };
    const result = detectProxyAnonymity(req, connecting);
    assert.equal(result.level, 'ELITE');
  });

  it('classifies transparent when XFF leaks client IP', () => {
    const req = {
      headers: {
        'x-real-ip': connecting,
        'x-forwarded-for': '198.51.100.7',
      },
    };
    const result = detectProxyAnonymity(req, connecting);
    assert.equal(result.level, 'TRANSPARENT');
    assert.equal(result.originalClientIP, '198.51.100.7');
  });

  it('classifies anonymous when Via is present without client IP', () => {
    const req = {
      headers: {
        'x-real-ip': connecting,
        via: '1.1 proxy.example',
      },
    };
    const result = detectProxyAnonymity(req, connecting);
    assert.equal(result.level, 'ANONYMOUS');
    assert.equal(result.originalClientIP, null);
  });

  it('classifies anonymous when IP intelligence detects a proxy', () => {
    const req = {
      headers: {
        'x-real-ip': connecting,
        host: 'api.proxy-judge.com',
      },
    };
    const result = detectProxyAnonymity(req, connecting, { proxyDetected: true });
    assert.equal(result.level, 'ANONYMOUS');
    assert.equal(result.proxyDetected, true);
    assert.equal(result.originalClientIP, null);
  });

  it('keeps a leaked original IP transparent even when IP intelligence detects a proxy', () => {
    const req = {
      headers: {
        'x-real-ip': connecting,
        'x-forwarded-for': '198.51.100.7',
      },
    };
    const result = detectProxyAnonymity(req, connecting, { proxyDetected: true });
    assert.equal(result.level, 'TRANSPARENT');
    assert.equal(result.originalClientIP, '198.51.100.7');
  });
});
