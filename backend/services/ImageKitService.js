const ImageKit = require("imagekit");

let instance = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

class ImageKitService {
  static uploadImage(pathOrBuffer, fileName, folder) {
    return instance.upload({
      file: pathOrBuffer,
      fileName,
      useUniqueFileName: true,
      folder,
    });
  }
}

module.exports = ImageKitService;
