import { describe, expect, it } from 'vitest'
import { diff_match_patch as DMP } from 'diff-match-patch'
import type { Diff } from 'diff-match-patch'

interface PatchStep {
  type: 'insert'
  from: number
  text: string
}
interface RemovalPatch {
  type: 'removal'
  from: number
  length: number
}

type Patch = PatchStep | RemovalPatch

const input = `
import { describe, expect, it } from 'vitest'

describe('Hi', () => {
  it('should works', () => {
    expect(1 + 1).toEqual(2)
  })
})
`

const output = `
import { describe, expect, it } from 'vitest'
import { cc } from '..'

describe('Hi', () => {
  it('diff', () => {
    expect(1 + 1).toEqual(2)
  })
  it('cc', () => {
    expect(Math.max(1,2)).toBe(2)
  })
})

`
function diff(a: string, b: string): Diff[] {
  const dmp = new DMP()
  const output = dmp.diff_main(a, b)
  dmp.diff_cleanupSemantic(output)
  return output
}

function caluctatePatch(diff: Diff[]): Patch[] {
  const patches: Patch[] = []
  // console.log(diff)
  let index = 0
  for (const change of diff) {
    if (change[0] === 0) {
      index += change[1].length
      continue
    }
    else if (change[0] === -1) {
      const length = change[1].length
      patches.push({
        type: 'removal',
        from: index + length,
        length,
      })
      /**
       * type为0的时候,值不会包括要删除的部分
       */
      // index -= length
    }
    else if (change[0] === 1) {
      patches.push({
        type: 'insert',
        from: index,
        text: change[1],
      })
      index += change[1].length
    }
  }

  return patches
}

function applyPatches(input: string, patches: Patch[]) {
  let output = input
  for (const patch of patches) {
    if (patch.type === 'insert')
      output = output.slice(0, patch.from) + patch.text + output.slice(patch.from)

    else if (patch.type === 'removal')
      output = output.slice(0, patch.from - patch.length) + output.slice(patch.from)
  }
  return output
}

describe('diff', () => {
  it('should works', () => {
    const delta = diff(input, output)
    const patches = caluctatePatch(delta)
    const result = applyPatches(input, patches)
    expect(result).toEqual(output)
    expect(result).toMatchInlineSnapshot(`
      "
      import { describe, expect, it } from 'vitest'
      import { cc } from '..'
      
      describe('Hi', () => {
        it('diff', () => {
          expect(1 + 1).toEqual(2)
        })
        it('cc', () => {
          expect(Math.max(1,2)).toBe(2)
        })
      })
      
      "
    `)
  })
})
