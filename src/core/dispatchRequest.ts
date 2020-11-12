import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL, isAbsoluteURL, combineURL } from '../helpers/url'
// import { transformRequest, transformResponse } from '../helpers/data'
import { flattenHeaders, processHeaders } from '../helpers/headers'

import transform from './transform' // 导入转化函数

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config) // 发送请求前  检测cancelToken是否已经使用

  processConfig(config) // 解析参数 params、data
  return xhr(config).then(
    res => {
      return transformResponseData(res)
    },
    e => {
      if (e && e.response) {
        e.response = transformResponseData(e.response)
      }
      return Promise.reject(e)
    }
  )
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)

  // config.headers = transformHeaders(config) // 先处理headers, 在处理data, 因为下面处理data的时候 已经将data转成了字符串
  // config.data = transformRequestData(config)

  config.data = transform(config.data, config.headers, config.transformRequest)

  config.headers = flattenHeaders(config.headers, config.method!)
}

export function transformURL(config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } = config
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }
  return buildURL(url!, params, paramsSerializer) // url后面加！, 类型断言
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

// function transformRequestData(config: AxiosRequestConfig): any {
//   return transformRequest(config.data)
// }
//
// function transformHeaders(config: AxiosRequestConfig): any {
//   const { headers = {}, data } = config // 给 headers 赋默认值不为空, 因为在pocessHeaders 判断了headers不为空 才执行逻辑
//   return processHeaders(headers, data)
// }

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
