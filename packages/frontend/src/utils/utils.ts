import * as pngitxt from "png-itxt";
import * as stream from "stream";

import { VerifiableCredential, VerifiablePresentation, VPClaim } from "../@types/utils-type";
import { CreateJWS, JWSObjToStrWithoutPayload } from "./did-jws";
import base64url from "base64url";

/**
 * create VP
 */
export const createVP = async (
  vcs: VerifiableCredential[],
  privateKey: string,
  did: string
): Promise<VerifiablePresentation> => {
  const vpClaim: VPClaim = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/openbadges/v3",
      "https://www.w3.org/ns/did/v1",
    ],
    type: "VerifiablePresentation",
    verifiableCredential: vcs,
  };
  const jwsObj = await CreateJWS(base64url(JSON.stringify(vpClaim)), privateKey);
  const proof = {
    proof: {
      type: "EcdsaSecp256k1VerificationKey2019",
      created: new Date().toISOString(),
      proofPurpose: "authentication",
      verificationMethod: did,
      domein: "string",
      jws: JWSObjToStrWithoutPayload(jwsObj),
    },
  };
  const vp: VerifiablePresentation = {
    ...vpClaim,
    ...proof,
  };
  return vp;
};

/**
 * get VC from base64url
 */
export const getVC = async (base64url: string): Promise<VerifiableCredential> => {
  const buf = base64ToBuf(base64url);
  const vc = await getVcFromBuf(buf);
  return vc;
};

/**
 * Base64 to Buffer
 * @param { string } base64Data
 * @return { Buffer } buf
 */
export const base64ToBuf = (base64Data: string): Buffer => {
  const fileData = base64Data.replace(/^data:\w+\/\w+;base64,/, "");
  const buf = Buffer.from(fileData, "base64");
  return buf;
};

/**
 * getVcFromBuf from Buffer
 * @param { Buffer } buf
 * @return { Promise<VerifiableCredential> } vc
 */
export const getVcFromBuf = async (buf: Buffer): Promise<VerifiableCredential> => {
  let vc: VerifiableCredential = vcInit();
  return new Promise(async (resolve) => {
    const readable = new stream.Readable();
    readable.push(buf);
    readable.push(null);
    await readable.pipe(
      pngitxt.get("openbadges", (err, buf) => {
        if (!err && buf) {
          vc = JSON.parse(buf.value);
          resolve(vc);
        } else {
          console.error("Please input PNG file!");
        }
      })
    );
  });
};

/**
 * Initialize verifiable credentials
 * @return { VerifiableCredential } vc
 */
const vcInit = (): VerifiableCredential => {
  const vc: VerifiableCredential = {
    "@context": [],
    id: "",
    type: [],
    issuer: {
      id: "",
      name: "",
      image: "",
      url: "",
      email: "",
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: "",
      achievement: {
        id: "",
        type: "",
        name: "",
        description: "",
        image: "",
        issuedOn: new Date().toISOString(),
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
      created: new Date().toISOString(),
      proofPurpose: "",
      verificationMethod: "",
      jws: "",
    },
  };
  return vc;
};
