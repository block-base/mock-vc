import * as fs from "fs";
import * as stream from "stream";
import * as pngitxt from "png-itxt";
import { Buffer } from "buffer";
import { EthrDID } from "ethr-did";

import { CreateJWS } from "./jws";

// DIDの秘密鍵と公開鍵のペアの作成
const keypair = EthrDID.createKeyPair();
const ethrDid = new EthrDID({ ...keypair });

const filePath = "./assets/good.png";

/**
 * Create Verifiable Credential
 * @param {CredentialSubject} credentialSubject
 * @return {Promise<VerifiableCredential>} vc - return VC.
 */
export const createVC = async (credentialSubject: CredentialSubject): Promise<VerifiableCredential> => {
  const claim = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/openbadges/v2",
      "https://www.w3.org/ns/did/v1",
    ],
    id: "credential-name-or-identifier",
    type: ["VerifiableCredential", "OpenBadge"],
    issuer: ethrDid.did,
    issuanceDate: new Date(),
    credentialSubject,
    criteria: "",
    credentialStatus: {
      id: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b", // IssuerのDIDのレジストリー。失効しているかどうかを調べるアドレス。この場合はスマートコントラクト
      type: "vcStatusRegistry2019", // ここはよくわかんない
    },
  };
  const jwsObj = await CreateJWS(Buffer.from(JSON.stringify(claim)).toString("base64"), keypair.privateKey);
  const vcJws = jwsObj.Header + ".." + jwsObj.Signature;
  const proof = {
    proof: {
      type: "EcdsaSecp256k1VerificationKey2019",
      created: new Date(),
      proofPurpose: "assertionMethod",
      // TODO: verificationMethodは公開鍵でいい？
      verificationMethod: keypair.publicKey,
      jws: vcJws,
    },
  };
  const vc: VerifiableCredential = { ...claim, ...proof };
  return vc;
};

/**
 * baking json-ld data to PNG.
 * @param {VerifiableCredential} verifiableCredential
 * @return {Promise<string>} base64Data - return PNG base64.
 */
export const bakingPNG = async (verifiableCredential: VerifiableCredential): Promise<string> => {
  fs.createReadStream(filePath)
    .pipe(pngitxt.set({ keyword: "openbadges", value: JSON.stringify(verifiableCredential) }, true))
    .pipe(fs.createWriteStream("./output/good-ob.png"));
  const base64Data = fs.readFileSync("./output/good-ob.png", { encoding: "base64" });
  return base64Data;
};

export const verifyVC = async (base64Data: string): Promise<boolean> => {
  getITXT(base64ToBuf(base64Data));
  return true;
};

// TODO: readableらへんの挙動はよくわかっていないので調べる
export const getITXT = async (buf: Buffer): Promise<VerifiableCredential> => {
  let vc: VerifiableCredential = vcInit();
  const readable = new stream.Readable();
  readable.push(buf);
  readable.push(null);
  await readable.pipe(
    pngitxt.get("openbadges", (err, buf) => {
      if (!err && buf) {
        vc = JSON.parse(buf.value);
        console.log(vc);
      } else {
        console.error("Please input PNG file!");
      }
    })
  );
  return vc;
};

export const base64ToBuf = (base64Data: string): Buffer => {
  const fileData = base64Data.replace(/^data:\w+\/\w+;base64,/, "");
  const buf = Buffer.from(fileData, "base64");
  return buf;
};

const vcInit = (): VerifiableCredential => {
  const vc: VerifiableCredential = {
    "@context": [],
    id: "",
    type: [],
    issuer: "",
    issuanceDate: new Date(),
    credentialSubject: {
      id: "",
      hasCredential: {
        id: "",
        type: "",
        name: "",
        description: "",
        image: "",
        issuedOn: new Date(),
        achievementType: "",
        creater: "",
        criteria: {
          narrative: "",
        },
      },
    },
    credentialStatus: {
      id: "",
      type: "",
    },
    proof: {
      type: "",
      created: new Date(),
      proofPurpose: "",
      verificationMethod: "",
      jws: "",
    },
  };
  return vc;
};
