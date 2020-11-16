import { AxiosRequestConfig } from '../types'
import { isPlainObject, deepMerge } from '../helpers/util'
const strats = Object.create(null)

function defaultStrat(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}

function fromVal2Strat(val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') {
    return val2
  }
}

function deepMergeStrat(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else {
    return val1
  }
}

// function mergeTransform(val: any, val2: any): any {
//   if (Array.isArray(val2)) {
//     return val.concat(val2)
//   } else {
//     return val
//   }
// }

const stratKeysFromVal2 = ['url', 'params', 'data']

stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})

const stratKeysDeepMerge = ['headers', 'auth']
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

// const stratKeysTransform = ['transformRequest']
// stratKeysTransform.forEach(key => {
//   strats[key] = mergeTransform
// })

/**
 * 将config1 合并到 config2
 * @param config1 默认配置
 * @param config2 自定义配置
 */

export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) {
    config2 = {}
  }
  const config = Object.create(null)
  for (let key in config2) {
    // 遍历自定义 config 配置
    mergeField(key)
  }

  for (let key in config1) {
    // 遍历 默认 config 配置
    if (!config2[key]) {
      mergeField(key)
    }
  }

  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat
    config[key] = strat(config1[key], config2![key])
  }
  return config
}
