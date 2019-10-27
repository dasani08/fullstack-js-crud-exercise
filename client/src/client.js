import axios from 'axios'

class Client {
  constructor(opt = {}) {
    this.opt = Object.assign(this._getDefaultOption(), opt)
    this.request = axios.create(this.opt)
    this.request.interceptors.response.use(response => {
      if (response.data.status === 401) {
        return Promise.reject()
      }
      return response
    })
  }

  _getDefaultOption() {
    return {
      timeout: 30000
    }
  }

  _reset() {
    this.request = axios.create(this._getDefaultOption())
  }

  _create(opt) {
    return axios.create(Object.assign(this.opt, opt))
  }

  addHeader(key, value) {
    this.request.defaults.headers.common[key] = value
    return this
  }

  addHeaders(headers) {
    headers.forEach(({ key, value }) => {
      this.addHeader(key, value)
    })
    return this
  }

  // call api endpoint
  api(path, method = 'get', params = {}) {
    return new window.Promise((resolve, reject) => {
      if (!path) {
        // path is required
        return reject(new Error('Used: api(path, method, params)'))
      }

      // add '/' to path if missing
      if (path[0] !== '/') {
        path = '/' + path
      }

      // use v1 version
      path = process.env.REACT_APP_API_URL + path
      if (path.indexOf('?') !== -1) {
        path += '&_t=' + Date.now()
      } else {
        path += '?_t=' + Date.now()
      }

      // support shorthand api(path, params)
      // method will default to get
      if (arguments.length === 2 && String(method) === '[object Object]') {
        params = method
        method = 'get'
      }

      method = method.toLowerCase()
      if (['get', 'post', 'put', 'delete'].indexOf(method) === -1) {
        return reject(
          new Error(
            `ERR: ${method} not allowed, only allow get, post, put, delete`
          )
        )
      }

      if (method === 'get') {
        params = { params: params }
      }

      /*eslint no-unexpected-multiline: 0*/
      this.request[method](path, params)
        .then(resolve)
        .catch(reject)
    })
  }

  get(path, params = {}) {
    return this.api(path, 'get', params)
      .then(response => this.isSucessResponse(response))
      .then(response => response.data.data)
  }

  post(path, data = {}) {
    return this.api(path, 'post', data)
      .then(response => this.isSucessResponse(response))
      .then(response => response.data.data)
  }

  put(path, data = {}) {
    return this.api(path, 'put', data)
      .then(response => this.isSucessResponse(response))
      .then(response => response.data.data)
  }

  delete(path) {
    return this.api(path, 'delete')
      .then(response => this.isSucessResponse(response))
      .then(response => response.data.data)
  }

  // Wrapper of axios's helper
  all(requests) {
    return axios.all(requests)
  }

  // Wrapper of axios's helper
  spread(cb) {
    return axios.spread(cb)
  }

  isSucessResponse(response) {
    if (response.data.status !== 200) {
      throw new Error(response.data.message)
    }
    return response
  }
}

export default new Client()
