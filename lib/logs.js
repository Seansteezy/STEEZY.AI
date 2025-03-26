let stdouts = []

// This function is used to capture and limit the length of stdout logs
export default function captureStdout(maxLength = 200) {
  // Store original write function
  const originalWrite = process.stdout.write.bind(process.stdout)

  // Flag to track if the stdout has been modified
  let isModified = true

  // Disable the stdout capturing and restore original behavior
  function disableCapture() {
    isModified = false
    process.stdout.write = originalWrite
  }

  // Override stdout.write to capture the logs
  process.stdout.write = (chunk, encoding, callback) => {
    stdouts.push(Buffer.from(chunk, encoding))
    originalWrite(chunk, encoding, callback)
    if (stdouts.length > maxLength) {
      stdouts.shift() // Remove the oldest entry when exceeding maxLength
    }
  }

  // Return an object containing the modified state and disable function
  return {
    isModified,
    disable: disableCapture,
  }
}

// Function to retrieve the captured logs as a Buffer
export function getLogs() {
  return Buffer.concat(stdouts)
}