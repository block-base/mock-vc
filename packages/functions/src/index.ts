import * as functions from "firebase-functions";
import { bakingPNG, createVC, verifyVC } from "./utils";

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const cors = require("cors")({ origin: true });

// TODO: 受け取ったDIDに対してvcを発行
// vcを作成してimageにOpenBadges形式でbakeする
// Base64で画像を返す
// 今回はclaimは固定

export const issue = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const claim = (did: string, createrDid: string): CredentialSubject => {
      return {
        id: did,
        hasCredential: {
          id: "https://api.badgr.io/public/badges/GsE7QrL6RA-vkprVsHVakw",
          type: "BadgeClass",
          name: "good-badges",
          description: "よくできました",
          image: "https://api.badgr.io/public/assertions/pbwAU69QTK24Vf58X0SERA/image",
          issuedOn: new Date(),
          achievementType: "Certificate",
          creater: createrDid,
          criteria: {
            narrative:
              "To earn this badge, the student must complete all coursework and assessment criteria for the BlockBase OpenBadges v3 Program",
          },
        },
      };
    };
    const vc = await createVC(claim(request.body.did, "did:key:z6Mksm3hensaRNjXMyRWo95UPoDB7DDyZvvXUe6VKszaCJBv"));
    const openbadgeV3 = `data:image/png;base64,${await bakingPNG(vc)}`;
    response.send({ openbadgeV3 });
  });
});

// TODO: 受け取ったBase64からiTxTをとってきてVCの検証
// 検証結果をResultとして返す
export const verify = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    verifyVC(request.body.vc);
    const result = true;
    response.send({ result });
  });
});
