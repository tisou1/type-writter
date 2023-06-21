import { describe, expect, it } from 'vitest'

describe('Hi', () => {
  it('should works', () => {
    expect(1 + 2).toMatchInlineSnapshot('3')
  })
})
