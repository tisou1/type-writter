<script setup lang="ts">
import _TypeIt from 'typeit'
import { debounce } from 'lodash'
import { caluctatePatch, diff } from '~/index'
const TypeIt = _TypeIt as any
let typeit: any
const data = reactive({
  input: `
  import { diff_match_patch as DMP } from 'diff-match-patch'
import type { Diff } from 'diff-match-patch'

export interface PatchStep {
  type: 'insert'
  from: number
  text: string
}
`,
  output: `
 import { diff_match_patch as DMP } from 'diff-match-patch'

export interface PatchStep {
  type: 'insert'
  from: number
  name: string
}
`,
  result: '',
})
onMounted(() => {
  start()
})
// 这里最好加一个防抖函数,不然高频率的更新有点问题
onUpdated(debounce(() => {
  start()
}, 1000))
// watch(() => [data.input, data.output], ([newInput, newOutput], [oldInput, oldOutput]) => {
//   debounce(() => {
//     console.log('debounce')
//   }, 1000)
// })
function start() {
  if (typeit)
    typeit.reset()

  typeit = new TypeIt('#result', {
    speed: 100,
    waitUntilVisible: true,
  })

  const patches = caluctatePatch(diff(data.input, data.output))

  typeit
    .type(data.input, { instant: true })

  for (const patch of patches) {
    typeit
      .pause(800)
    if (patch.type === 'insert') {
      typeit
        .move(null, { to: 'START', instant: true })
        .move(patch.from, { instant: true })
        .type(patch.text, { delay: 300 })
    }
    else {
      typeit
        .move(null, { to: 'START', instant: true })
        .move(patch.from, { instant: true })
        .delete(patch.length)
    }
  }

  typeit.go()
}

</script>

<template>
  <div class="text-black text-left">
    <div>
      <pre id="result" text-gray-200>{{ data.result }}</pre>
    </div>
    <div class="w-full">
      <textarea id="input" v-model="data.input" class="w-[calc(50%-10px)] h-60vh mr-1 border border-blue-300 " />
      <textarea id="output" v-model="data.output" class="w-[calc(50%-10px)] h-60vh border border-blue-300 " />
    </div>
  </div>
</template>

<style scoped>
  pre{
    height: 300px;
  }
</style>
