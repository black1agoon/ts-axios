import {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  RejectedFn,
  ResolvedFn
} from '../types'
import dispatchRequest, { transformURL } from './dispatchRequest'
import InterceptorManager from './interceptorManager'
import mergeConfig from './mergeConfig'

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise) // ResolvedFn 或 dispatch的类型
  rejected?: RejectedFn
}

export default class Axios {
  defaults: AxiosRequestConfig // 默认配置
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }
  // request(config: AxiosRequestConfig): AxiosPromise {
  //   return dispatchRequest(config)
  // }
  // 实现重载
  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }

    // 合并配置

    config = mergeConfig(this.defaults, config)

    // const chain: PromiseChain<any>[] = [
    const chain: Array<PromiseChain<any>> = [
      {
        resolved: dispatchRequest,
        rejected: undefined
      }
    ]

    this.interceptors.request.forEach2(interceptor => {
      chain.unshift(interceptor)
    })

    this.interceptors.response.forEach2(interceptor => {
      chain.push(interceptor)
    })

    let promise = Promise.resolve(config)
    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }

    // return dispatchRequest(config)
    return promise // 完成链式调用
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMehodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMehodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMehodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMehodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMehodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMehodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMehodWithData('patch', url, data, config)
  }

  getUri(config?: AxiosRequestConfig): string {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }

  _requestMehodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMehodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
