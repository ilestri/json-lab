import { beforeAll } from 'vitest'

beforeAll(() => {
  // jsdom clipboard mock
  if (!('clipboard' in navigator)) {
    // @ts-expect-error jsdom polyfill
    navigator.clipboard = {
      writeText: async () => {},
    }
  }
})
