import _ from 'lodash'

declare global {
  interface Array<T> {
    includesDeep(value: T): boolean
  }
}

Array.prototype.includesDeep = function <T>(value: T): boolean {
  return this.some((item) => _.isEqual(item, value))
}

export default {}
