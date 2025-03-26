import pkg from 'imgur'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const { ImgurClient } = pkg

// Initialize Imgur client with Client ID from environment variables
const client = new ImgurClient({ clientId: process.env.IMGUR_CLIENT_ID })

/**
 * Uploads an image to Imgur.
 * @param {string} imagePath - The path to the image you want to upload.
 * @returns {Promise<string>} - The URL of the uploaded image.
 */
async function uploadToImgur(imagePath) {
  // Check if the file exists before attempting to upload
  if (!fs.existsSync(imagePath)) {
    throw new Error('Image file does not exist')
  }

  try {
    // Upload image
    const response = await client.upload({
      image: fs.createReadStream(imagePath),
      type: 'stream',
    })

    // Check if the response contains a valid URL
    const url = response.data.link
    if (!url) {
      throw new Error('Failed to get the image URL from Imgur response')
    }

    console.log('Uploaded image URL:', url)
    return url
  } catch (error) {
    console.error('Error uploading image to Imgur:', error)
    throw error
  }
}

export default uploadToImgur