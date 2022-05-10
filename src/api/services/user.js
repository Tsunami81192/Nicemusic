import api from './instance'

/**
 * @method 手机登录
 * @params phone 用户id
 */
export const login = (phone, password) =>
  api.get(`/login/cellphone?phone=${phone}&password=${password}`, {
    withCredentials: true
  })

/**
 * @method 获取用户详情
 * @params uid 用户id
 */
export const getUserDetail = uid => api.get(`/user/detail?uid=${uid}`, {})

/**
 * @method 获取用户播放记录
 * @params uid 用户 id
 * @params type : type=1 时只返回 weekData, type=0 时返回 allData
 */

export const getUserRecord = (uid, type) =>
  api.get(`/user/record?uid=${uid}&type=${type}`, {})

/**
 * @method 获取用户歌单
 * @params uid 用户 id
 */

export const getUserArtist = uid => api.get(`/user/playlist?uid=${uid}`, {})

/**
 * @method 获取用户播放记录
 * @params type 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到
 * */

export const userSign = () => api.get(`/daily_signin?type=1`, {})

// 退出登录
export const logout = () => api.get(`/logout`, {})
