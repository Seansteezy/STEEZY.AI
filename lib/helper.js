// @ts-check
import yargs from 'yargs'
import os from 'os'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import fs from 'fs'
import Stream, { Readable } from 'stream'

/**
 * Utility to get the current filename from URL or import.meta
 * @param {ImportMeta | string} pathURL
 * @param {boolean?} rmPrefix if value is `'true'`, it will remove `'file://'` prefix, if windows it will automatically false
 * @returns {string}
 */
const __filename = function filename(pathURL = import.meta, rmPrefix = os.platform() !== 'win32') {
  const path = /** @type {ImportMeta} */ (pathURL).url || /** @type {string} */ (pathURL)
  return rmPrefix
    ? /file:\/\/\//.test(path)
      ? fileURLToPath(path)
      : path
    : /file:\/\/\//.test(path)
      ? path
      : pathToFileURL(path).href
}

/**
 * Utility to get the current directory from URL or import.meta
 * @param {ImportMeta | string} pathURL
 * @returns {string}
 */
const __dirname = function dirname(pathURL) {
  const dir = __filename(pathURL, true)
  const regex = /\/$/
  return regex.test(dir)
    ? dir
    : fs.existsSync(dir) && fs.statSync(dir).isDirectory()
    ? dir.replace(regex, '')
    : path.dirname(dir)
}

/**
 * Creates a require function based on the directory or import.meta
 * @param {ImportMeta | string} dir
 * @returns {NodeRequire}
 */
const __require = function require(dir = import.meta) {
  const path = /** @type {ImportMeta} */ (dir).url || /** @type {string} */ (dir)
  return createRequire(path)
}

/**
 * Check if a file exists
 * @param {string} file
 * @returns {Promise<boolean>}
 */
const checkFileExists = file =>
  fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)

/**
 * Generate an API URL with optional query parameters
 * @param {string} name API name
 * @param {string} path API path (optional)
 * @param {Record<string, any>} query Query parameters (optional)
 * @param {string} apikeyqueryname API key query parameter name (optional)
 * @returns {string}
 */
const API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname
            ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] }
            : {}),
        })
      )
    : '')

/** @type {ReturnType<yargs.Argv['parse']>} */
const opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
const prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(
      /[|\\{}()[\]^$+*?.\-\^]/g,
      '\\$&'
    ) +
    ']'
)

/**
 * Save a readable stream to a file
 * @param {Readable} stream
 * @param {string} file
 * @returns {Promise<void>}
 */
const saveStreamToFile = (stream, file) =>
  new Promise((resolve, reject) => {
    const writable = stream.pipe(fs.createWriteStream(file))
    writable.once('finish', () => {
      resolve()
      writable.destroy()
    })
    writable.once('error', () => {
      reject()
      writable.destroy()
    })
  })

const kDestroyed = Symbol('kDestroyed')
const kIsReadable = Symbol('kIsReadable')

/**
 * Check if an object is a readable stream
 * @param {any} obj
 * @param {boolean} strict
 * @returns {boolean}
 */
const isReadableNodeStream = (obj, strict = false) => {
  return !!(
    obj &&
    typeof obj.pipe === 'function' &&
    typeof obj.on === 'function' &&
    (!strict || (typeof obj.pause === 'function' && typeof obj.resume === 'function')) &&
    (!obj._writableState || obj._readableState?.readable !== false) && // Duplex
    (!obj._writableState || obj._readableState)
  )
}

/**
 * Check if an object is a valid node stream (Readable or Writable)
 * @param {any} obj
 * @returns {boolean}
 */
const isNodeStream = obj => {
  return (
    obj &&
    (obj._readableState ||
      obj._writableState ||
      (typeof obj.write === 'function' && typeof obj.on === 'function') ||
      (typeof obj.pipe === 'function' && typeof obj.on === 'function'))
  )
}

/**
 * Check if a stream is destroyed
 * @param {NodeJS.ReadableStream} stream
 * @returns {boolean|null}
 */
const isDestroyed = stream => {
  if (!isNodeStream(stream)) return null
  const wState = stream._writableState
  const rState = stream._readableState
  const state = wState || rState
  return !!(stream.destroyed || stream[kDestroyed] || state?.destroyed)
}

/**
 * Check if a readable stream is finished
 * @param {Readable} stream
 * @param {boolean} strict
 * @returns {boolean|null}
 */
const isReadableFinished = (stream, strict) => {
  if (!isReadableNodeStream(stream)) return null
  const rState = stream._readableState
  if (rState?.errored) return false
  if (typeof rState?.endEmitted !== 'boolean') return null
  return !!(rState.endEmitted || (strict === false && rState.ended === true && rState.length === 0))
}

/**
 * Check if an object is a readable stream
 * @param {Readable} stream
 * @returns {boolean|null}
 */
const isReadableStream = stream => {
  if (typeof Stream.isReadable === 'function') return Stream.isReadable(stream)
  if (stream && stream[kIsReadable] != null) return stream[kIsReadable]
  if (typeof stream?.readable !== 'boolean') return null
  if (isDestroyed(stream)) return false
  return (
    (isReadableNodeStream(stream) && !!stream.readable && !isReadableFinished(stream)) ||
    stream instanceof fs.ReadStream ||
    stream instanceof Readable
  )
}

export default {
  __filename,
  __dirname,
  __require,
  checkFileExists,
  API,

  saveStreamToFile,
  isReadableStream,

  opts,
  prefix,
}