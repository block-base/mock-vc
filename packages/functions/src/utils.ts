import * as fs from "fs";
import * as pngitxt from "png-itxt";

import { LocalCryptUtils } from "crypt-util";
import { VerifiableCredentialSigner, VerifiableCredentialGenerator } from "vp-toolkit";
import { CredentialStatus, VerifiableCredential } from "vp-toolkit-models";
import { EthrDID } from "ethr-did";

// DIDの秘密鍵と公開鍵のペアの作成
const keypair = EthrDID.createKeyPair();
const ethrDid = new EthrDID({ ...keypair });

// TODO: ハードコーディングしている秘密鍵を変える
const yourPrivateKey =
  "xprv9s21ZrQH143K4Hahxy3chUqrrHbCynU5CcnRg9xijCvCG4f3AJb1PgiaXpjik6pDnT1qRmf3V3rzn26UNMWDjfEpUKL4ouy6t5ZVa4GAJVG";

const cryptAlgorithm = new LocalCryptUtils(); // secp256k1 algorithm
const signer = new VerifiableCredentialSigner(cryptAlgorithm);
const generator = new VerifiableCredentialGenerator(signer);

const filePath = "./assets/good.png";

cryptAlgorithm.importMasterPrivateKey(yourPrivateKey);

/**
 * Create Verifiable Credential
 * @param {CredentialSubject} credentialSubject
 * @return {VerifiableCredential} verifiableCredential return VC.
 */
export async function createVC(credentialSubject: CredentialSubject): Promise<VerifiableCredential> {
  console.log(keypair.privateKey.slice(2));
  console.log(keypair.privateKey);
  const claim = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/openbadges/v2",
      "https://www.w3.org/ns/did/v1",
      "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld",
    ],
    id: "credential-name-or-identifier",
    type: ["VerifiableCredential", "OpenBadge"],
    issuer: ethrDid.did,
    issuanceDate: new Date(),
    credentialSubject,
    criteria: "",
    credentialStatus: new CredentialStatus({
      id: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b", // IssuerのDIDのレジストリー。失効しているかどうかを調べるアドレス。この場合はスマートコントラクト
      type: "vcStatusRegistry2019", // ここはよくわかんない
    }),
  };
  const verifiableCredential = generator.generateVerifiableCredential(claim, 0, 0);
  return verifiableCredential;
}

/**
 * baking json-ld data to PNG.
 * @param {VerifiableCredential} verifiableCredential
 * @return {Promise<string>} return PNG base64.
 */
export async function bakingPNG(verifiableCredential: VerifiableCredential): Promise<string> {
  fs.createReadStream(filePath)
    .pipe(pngitxt.set({ keyword: "openbadges", value: JSON.stringify(verifiableCredential) }, true))
    .pipe(fs.createWriteStream("./output/good-ob.png"));
  const base64Data = fs.readFileSync("./output/good-ob.png", { encoding: "base64" });
  return base64Data;
}
