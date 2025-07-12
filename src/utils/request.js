import axios from 'axios'
import { MessageBox, Notification } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // Use Authorization: Bearer token format for API authentication
      config.headers['Authorization'] = `${getToken()}`
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  },
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (res?.code !== undefined) {
      // If the response data does not have a code field, it is considered a normal response.
      if (res.code !== 200) {
        Notification({
          title: 'Notification Error',
          message: res.msg || res.message || 'Error',
          type: 'error',
          position: 'top-right',
          // duration: 5 * 1000
        })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      //   // to re-login
      //   MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
      //     confirmButtonText: 'Re-Login',
      //     cancelButtonText: 'Cancel',
      //     type: 'warning'
      //   }).then(() => {
      //     store.dispatch('user/resetToken').then(() => {
      //       location.reload()
      //     })
      //   })
      // }
      // return Promise.reject(new Error(res.message || 'Error'))
      } else {
        return res
      }
    }
    return res
  },
  error => {
    const statusCode = error.response?.status
    const errorData = error.response?.data

    // Handle different HTTP status codes
    if (statusCode === 401) {
      MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        confirmButtonText: 'Re-Login',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
      return
    }

    // Handle 404 errors (endpoint not found)
    if (statusCode === 404) {
      Notification({
        title: 'API Error',
        message: 'The requested resource was not found. Please check if the API endpoint is available.',
        type: 'error',
        position: 'top-right',
        duration: 5000,
      })
      return Promise.reject(error)
    }

    // Handle 500 errors (server errors)
    if (statusCode >= 500) {
      Notification({
        title: 'Server Error',
        message: errorData?.message || 'Internal server error. Please try again later.',
        type: 'error',
        position: 'top-right',
        duration: 5000,
      })
      return Promise.reject(error)
    }

    // Handle other API errors with proper error messages
    if (errorData?.message || errorData?.msg) {
      Notification({
        title: 'API Error',
        message: errorData.message || errorData.msg,
        type: 'error',
        position: 'top-right',
        duration: 5000,
      })
    }

    console.log('err' + error) // for debug
    return Promise.reject(error)
  },
)

export default service
