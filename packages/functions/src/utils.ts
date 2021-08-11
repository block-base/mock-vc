import * as fs from "fs";
import * as pngitxt from "png-itxt";

const filePath = "./assets/good.png";

export const vc = `data:image/png;base64,${bakingPNG()}`;

/**
 * baking json-ld data to PNG.
 * @return {string} return PNG base64.
 */
function bakingPNG(): string {
  fs.createReadStream(filePath)
    .pipe(pngitxt.set({ keyword: "openbadges", value: JSON.stringify({}) }, true))
    .pipe(fs.createWriteStream("./output/good-ob.png"));

  const base64Data = fs.readFileSync(filePath, { encoding: "base64" });
  return base64Data;
}
