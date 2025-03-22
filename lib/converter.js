import { promises as fs } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

/**
 * Utility function to process media files using ffmpeg.
 * @param {Buffer} buffer - The input media buffer.
 * @param {Array<string>} args - FFmpeg arguments.
 * @param {string} inputExt - Input file extension.
 * @param {string} outputExt - Output file extension.
 * @returns {Promise<{data: Buffer, filename: string, delete: Function}>}
 */
function ffmpeg(buffer, args = [], inputExt = '', outputExt = '') {
  return new Promise(async (resolve, reject) => {
    if (!Buffer.isBuffer(buffer)) {
      return reject(new Error('Input must be a Buffer.'));
    }
    if (typeof inputExt !== 'string' || typeof outputExt !== 'string') {
      return reject(new Error('File extensions must be strings.'));
    }

    try {
      // Generate unique temporary file paths
      const tmpDir = join(__dirname, '../tmp');
      await fs.mkdir(tmpDir, { recursive: true }); // Ensure tmp directory exists
      const tmpFile = join(tmpDir, `${Date.now()}-${Math.random().toString(36).slice(2)}.${inputExt}`);
      const outFile = `${tmpFile}.${outputExt}`;

      // Write input buffer to temporary file
      await fs.writeFile(tmpFile, buffer);

      // Spawn ffmpeg process
      const ffmpegProcess = spawn('ffmpeg', ['-y', '-i', tmpFile, ...args, outFile]);

      ffmpegProcess.on('error', (err) => {
        reject(new Error(`FFmpeg process error: ${err.message}`));
      });

      ffmpegProcess.on('close', async (code) => {
        try {
          await fs.unlink(tmpFile); // Clean up input file
          if (code !== 0) {
            return reject(new Error(`FFmpeg process exited with code ${code}`));
          }

          // Read output file and resolve
          const data = await fs.readFile(outFile);
          resolve({
            data,
            filename: outFile,
            delete: () => fs.unlink(outFile).catch(() => {}), // Silent cleanup
          });
        } catch (err) {
          reject(new Error(`File operation error: ${err.message}`));
        }
      });
    } catch (err) {
      reject(new Error(`Unexpected error: ${err.message}`));
    }
  });
}

/**
 * Convert audio buffer to WhatsApp PTT format (OGG Opus).
 * @param {Buffer} buffer - The input audio buffer.
 * @param {string} ext - Input file extension.
 * @returns {Promise<{data: Buffer, filename: string, delete: Function}>}
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on'], ext, 'ogg');
}

/**
 * Convert audio buffer to WhatsApp audio format (Opus).
 * @param {Buffer} buffer - The input audio buffer.
 * @param {string} ext - Input file extension.
 * @returns {Promise<{data: Buffer, filename: string, delete: Function}>}
 */
function toAudio(buffer, ext) {
  return ffmpeg(
    buffer,
    ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10'],
    ext,
    'opus'
  );
}

/**
 * Convert video buffer to WhatsApp video format (MP4).
 * @param {Buffer} buffer - The input video buffer.
 * @param {string} ext - Input file extension.
 * @returns {Promise<{data: Buffer, filename: string, delete: Function}>}
 */
function toVideo(buffer, ext) {
  return ffmpeg(
    buffer,
    [
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      '-ab',
      '128k',
      '-ar',
      '44100',
      '-crf',
      '32',
      '-preset',
      'slow',
    ],
    ext,
    'mp4'
  );
}

export { toAudio, toPTT, toVideo, ffmpeg };
