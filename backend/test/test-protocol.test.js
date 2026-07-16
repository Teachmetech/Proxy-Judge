import test from 'node:test';
import assert from 'node:assert/strict';
import { getTestProtocol } from '../src/services/testProtocol.js';

test('normalizes supported proxy test protocol claims', () => {
  assert.equal(getTestProtocol('http'), 'HTTP');
  assert.equal(getTestProtocol('HTTPS_CONNECT'), 'HTTPS_CONNECT');
  assert.equal(getTestProtocol('connect'), 'HTTPS_CONNECT');
  assert.equal(getTestProtocol('https_proxy'), 'HTTPS');
  assert.equal(getTestProtocol('socks4'), 'SOCKS4');
  assert.equal(getTestProtocol('SOCKS5H'), 'SOCKS5');
});

test('rejects missing and unknown protocol claims', () => {
  assert.equal(getTestProtocol(undefined), null);
  assert.equal(getTestProtocol(''), null);
  assert.equal(getTestProtocol('ftp'), null);
  assert.equal(getTestProtocol(['socks5']), null);
});
