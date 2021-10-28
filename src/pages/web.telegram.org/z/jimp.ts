import Jimp from "jimp";
import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qrCode = require("qrcode-reader");

const buffer = fs.readFileSync(__dirname + "/index.png");
if (!buffer) {
  throw new Error("Could not read image");
}
// console.log(buffer.byteLength, "bytes read");
export default new Promise((resolve, reject) => {
  Jimp.read(buffer, callback);

  function callback(err: any, image: { bitmap: any }) {
    if (err) {
      reject(err);
    }
    const qrcode = new qrCode();
    qrcode.callback = function (err: any, value: { result: any }) {
      if (err) {
        reject(err);
      }
      resolve(value.result);
    };
    qrcode.decode(image.bitmap);
  }
});
