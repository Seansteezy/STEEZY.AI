import fs from 'fs/promises'
import { promisify } from 'util'
import { execFile } from 'child_process'
import path from 'path'

const __dirname = path.resolve()
const sleep = promisify(setTimeout)

const GIFBufferToVideoBuffer = async (image) => {
  try {
    const filename = `${Math.random().toString(36)}`
    const tmpDir = path.join(__dirname, 'tmp')

    // Ensure tmp directory exists
    await fs.mkdir(tmpDir, { recursive: true })

    const gifFilePath = path.join(tmpDir, `${filename}.gif`)
    const mp4FilePath = path.join(tmpDir, `${filename}.mp4`)

    await fs.writeFile(gifFilePath, image)

    // Convert GIF to MP4 using FFmpeg
    await promisify(execFile)('ffmpeg', [
      '-i', gifFilePath,
      '-movflags', 'faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      mp4FilePath
    ])

    // Wait until file is fully written
    while (!(await fs.stat(mp4FilePath)).size) {
      await sleep(500)
    }

    const videoBuffer = await fs.readFile(mp4FilePath)

    // Clean up temp files
    await Promise.all([fs.unlink(gifFilePath), fs.unlink(mp4FilePath)])

    return videoBuffer
  } catch (error) {
    console.error(error)
    throw new Error('Error processing GIF to video.')
  }
}

export default GIFBufferToVideoBuffer
