import * as authToken from './authToken';

describe('authToken (in memory)', () => {
  beforeEach(() => authToken.clear());

  it('starts empty', () => {
    expect(authToken.get()).toBeNull();
    expect(authToken.getAccessToken()).toBeNull();
  });

  it('sets and gets a token', () => {
    authToken.set('abc');
    expect(authToken.get()).toBe('abc');
    expect(authToken.getAccessToken()).toBe('abc');
    expect(authToken.getToken()).toBe('abc');
  });

  it('clears the token', () => {
    authToken.setAccessToken('abc');
    authToken.clearAccessToken();
    expect(authToken.get()).toBeNull();
  });

  it('normalizes falsy values to null', () => {
    authToken.set(undefined);
    expect(authToken.get()).toBeNull();
    authToken.set('');
    expect(authToken.get()).toBe('');
  });
});
