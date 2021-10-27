//Importing jimp module
import Jimp from "jimp";
// Importing filesystem module
import fs from "fs";
// Importing qrcode-reader module
/* eslint-disable */
import qrCode from "qrcode-reader";

// Read the image and create a buffer
// (Here image.png is our QR code)
const buffer = fs.readFileSync(__dirname + "/index.png");

// Parse the image using Jimp.read() method
Jimp.read(buffer, function (err, image) {
  if (err) {
    console.error(err);
  }
  // Creating an instance of qrcode-reader module
  const qrcode = new qrCode();
  qrcode.callback = function (err: any, value: { result: any }) {
    if (err) {
      console.error(err);
    }
    // Printing the decrypted value
    console.log(value.result);
  };
  // Decoding the QR code
  qrcode.decode(image.bitmap);
});
