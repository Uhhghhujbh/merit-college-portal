import sharp from 'sharp';

export const processImage = async (imageBuffer, maxSizeKB = 250) => {
  try {
    let quality = 90;
    let processedImage = await sharp(imageBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    // Reduce quality until size is under limit
    while (processedImage.length > maxSizeKB * 1024 && quality > 10) {
      quality -= 10;
      processedImage = await sharp(imageBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();
    }

    return processedImage;
  } catch (error) {
    throw new Error('Image processing failed');
  }
};