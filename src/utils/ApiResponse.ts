class ApiResponse {
  code: number
  message: string
  data: any

  constructor(message = 'Success', data?: any, code = 200) {
    this.code = code
    this.message = message
    this.data = data
  }
}

class ResponseSuccess extends ApiResponse {
  constructor(message = 'Success', data?: any, code = 200) {
    super(message, data, code)
  }
}

class ResponseFailure extends ApiResponse {
  stack?: string
  constructor(message = 'Error', code = 400, stack?: string) {
    super(message, undefined, code)
    this.stack = stack
  }
}

export { ApiResponse, ResponseSuccess, ResponseFailure }
