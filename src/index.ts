import { diff_match_patch as DMP } from 'diff-match-patch'
import type { Diff } from 'diff-match-patch'

export interface PatchStep {
  type: 'insert'
  from: number
  text: string
}
export interface RemovalPatch {
  type: 'removal'
  from: number
  length: number
}

export type Patch = PatchStep | RemovalPatch

export function diff(a: string, b: string): Diff[] {
  const dmp = new DMP()
  const output = dmp.diff_main(a, b)
  dmp.diff_cleanupSemantic(output)
  return output
}

export function caluctatePatch(diff: Diff[]): Patch[] {
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
export function applyPatches(input: string, patches: Patch[]) {
  let output = input
  for (const patch of patches) {
    if (patch.type === 'insert')
      output = output.slice(0, patch.from) + patch.text + output.slice(patch.from)

    else if (patch.type === 'removal')
      output = output.slice(0, patch.from - patch.length) + output.slice(patch.from)
  }
  return output
}
