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

export { ApiResponse }
