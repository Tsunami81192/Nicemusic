import axios from 'axios'
import qs from 'qs'
import config from '../config'
import router from '@/router'
import { Message } from 'element-ui'
const { api_base_url } = config

let instance = axios.create({
  time: 1000 * 60,
  baseURL: api_base_url,
  withCredentials: true
})

instance.defaults.responseType = 'json'
instance.defaults.withCredentials = true
instance.defaults.transformRequest = [
  data => {
    return qs.stringify(data)
  }
]
instance.defaults.validateStatus = function() {
  return true
}

// 请求拦截器
instance.interceptors.request.use(
  config => {
    return config
  },
  error => {
    Message.error({ message: '请求超时!' })
    return Promise.reject(error)
  }
)

// 响应拦截器即异常处理
instance.interceptors.response.use(
  response => {
    let data = response.data
    let status = response.status
    console.log(data)
    if (status === 200) {
      return Promise.resolve(data)
    } else if (status === 301) {
      Message.error({ message: '请先登录!' })
      router.replace({
        path: 'login'
      })
      return
    } else if (status === 400) {
      Message.error({ message: data.msg })
    } else {
      return Promise.reject(response)
    }
  },
  error => {
    console.log(error)
  }
)

let ajaxMethod = ['get', 'post']
let api = {}
ajaxMethod.forEach(method => {
  // 数组取值的两种方式
  api[method] = function(uri, data, config) {
    return new Promise(function(resolve, reject) {
      instance[method](uri, data, config)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
})

export default api
