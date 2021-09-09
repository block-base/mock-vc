import * as functions from "firebase-functions";
import { EthrDID } from "ethr-did";
import { verifyVP } from "./vp";
import { bakingPNG, createVC, verifyVC } from "./vc";

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const cors = require("cors")({ origin: true });

// DIDの秘密鍵と公開鍵のペアの作成
const keypair = EthrDID.createKeyPair();
const ethrDid = new EthrDID({ ...keypair });

/**
 * claimからVCを作成
 * Base64にして返す
 */
export const issue = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const claim = (learnerDid: string, createrDid: string): CredentialSubject => {
      return {
        id: learnerDid,
        achievement: {
          id: "https://example.org/achievements/123",
          type: "Achievement",
          achievementType: "Certificate",
          name: "Keio University Certificate of Graduation",
          description:
            "This is certify that {Name} successfully completed the 4 years of study in the {Undergraduate} at Keio University.",
          image: "http://sample_image.png",
          issuedOn: "2021-03-23T07:21:17.186Z",
          creater: createrDid,
        },
      };
    };
    const vc = await createVC(
      claim(request.body.did, "did:key:z6Mksm3hensaRNjXMyRWo95UPoDB7DDyZvvXUe6VKszaCJBv"),
      ethrDid,
      keypair
    );
    console.log(vc);
    const vcImg = `data:image/png;base64,${await bakingPNG(vc)}`;
    response.send({ vc: vcImg });
  });
});

/**
 * 受け取ったBase64からiTxTをとってきてVCの検証
 * 検証結果をResultとして返す
 */
export const verify = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const result = await verifyVC(request.body.vc);
    console.log(result ? "VC Verified!" : "VC VerifyFailed!");
    response.send({ result });
  });
});

/**
 * 受け取ったBase64からiTxTをとってきてVPの検証
 * 検証結果をResultとして返す
 */
export const present = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const vp: VerifiablePresentation = request.body.vp;
    const result = await verifyVP(vp);
    console.log(result ? "VP Verified!" : "VP VerifyFailed!");
    response.send({ result });
  });
});
