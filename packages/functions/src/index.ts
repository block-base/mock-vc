import * as functions from "firebase-functions";
import { vc } from "./utils";

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const cors = require("cors")({ origin: true });

// TODO: 受け取ったDIDに対してvcを発行
// vcを作成してimageにOpenBadges形式でbakeする
// Base64で画像を返す
export const issue = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    console.log(request.body.did);
    response.send({ vc });
  });
});

// TODO: 受け取ったBase64からiTxTをとってきてVCの検証
// 検証結果をResultとして返す
export const verify = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const result = true;
    response.send({ result });
  });
});
