export class DirectoryInvalidError extends Error {
  private _dirErr: string[] = []
  constructor() {
    super()
  }

  get dirErr() {
    return this._dirErr
  }

  push(dir: string) {
    this._dirErr.push(dir)
  } 

  hasError() {
    return this._dirErr.length
  }
}