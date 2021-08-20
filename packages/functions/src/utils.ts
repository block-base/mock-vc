import * as fs from "fs";
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
export async function createVC(credentialSubject: CredentialSubject): Promise<VerifiableCredential> {
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
  console.log(vc);
  return vc;
}

/**
 * baking json-ld data to PNG.
 * @param {VerifiableCredential} verifiableCredential
 * @return {Promise<string>} base64Data - return PNG base64.
 */
export async function bakingPNG(verifiableCredential: VerifiableCredential): Promise<string> {
  fs.createReadStream(filePath)
    .pipe(pngitxt.set({ keyword: "openbadges", value: JSON.stringify(verifiableCredential) }, true))
    .pipe(fs.createWriteStream("./output/good-ob.png"));
  const base64Data = fs.readFileSync("./output/good-ob.png", { encoding: "base64" });
  return base64Data;
}
