import * as fs from "fs";
import * as stream from "stream";
import * as pngitxt from "png-itxt";
import * as dotenv from "dotenv";
import { Buffer } from "buffer";
import { EthrDID } from "ethr-did";
import { VerificationMethod } from "did-resolver";
import base64url from "base64url";
import axios from "axios";

import { CreateJWS, JWSObjToStr, verifyJWS, initJWSObj } from "./did-jws";

dotenv.config();

// DIDの秘密鍵と公開鍵のペアの作成
const keypair = EthrDID.createKeyPair();
const ethrDid = new EthrDID({ ...keypair });

const filePath = "./assets/good.png";
const resolverBaseURL = "https://dev.uniresolver.io/1.0/identifiers/";

/*
const providerConfig = {
  networks: [
    { name: "mainnet", rpcUrl: process.env.INFURA_ENDPOINT!, registry: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b" },
  ],
};
*/

/**
 * Create Verifiable Credential
 * @param {CredentialSubject} credentialSubject
 * @return {Promise<VerifiableCredential>} vc - return VC.
 */
export const createVC = async (credentialSubject: CredentialSubject): Promise<VerifiableCredential> => {
  const claim: Claim = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/openbadges/v3",
      "https://www.w3.org/ns/did/v1",
    ],
    id: "credential-name-or-identifier",
    type: ["VerifiableCredential", "OpenBadge"],
    issuer: {
      id: ethrDid.did,
      name: "masaki obayashi",
      image: "sample.png",
      url: "masaki-university.com",
      email: "masaki-univ@mu.ed.jp",
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject,
    credentialStatus: {
      id: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b", // IssuerのDIDのレジストリー。失効しているかどうかを調べるアドレス。この場合はスマートコントラクト
      type: "vcStatusRegistry2019", // ここはよくわかんない
    },
  };

  const jwsObj = await CreateJWS(base64url(JSON.stringify(claim)), keypair.privateKey);
  const vcJws = JWSObjToStr(jwsObj);
  const proof = {
    proof: {
      type: "EcdsaSecp256k1VerificationKey2019",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: ethrDid.did,
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
  return new Promise((resolve) => {
    const st = fs
      .createReadStream(filePath)
      .pipe(pngitxt.set({ keyword: "openbadges", value: JSON.stringify(verifiableCredential) }, true));
    const bufs: Buffer[] = [];

    st.on("data", (chunk: Buffer) => {
      bufs.push(chunk);
    });
    st.once("end", () => {
      const base64Data = Buffer.concat(bufs).toString("base64");
      resolve(base64Data);
    });
  });
};

export const verifyVC = async (base64Data: string): Promise<boolean> => {
  const vc: VerifiableCredential = await getITXT(base64ToBuf(base64Data));
  const claim: Claim = extractClaim(vc);
  const verificationMethod = await didResolveGetVerificationMethods(vc.proof.verificationMethod);
  return verifyJWS(initJWSObj(vc.proof.jws), claim, verificationMethod);
};

/**
 * getiTxT from Buffer
 * @param { Buffer } buf
 * @return { Promise<VerifiableCredential> } vc
 */
export const getITXT = async (buf: Buffer): Promise<VerifiableCredential> => {
  let vc: VerifiableCredential = vcInit();
  const readable = new stream.Readable();
  readable.push(buf);
  readable.push(null);
  await readable.pipe(
    pngitxt.get("openbadges", (err, buf) => {
      if (!err && buf) {
        vc = JSON.parse(buf.value);
      } else {
        console.error("Please input PNG file!");
      }
    })
  );
  return vc;
};

/**
 * Resolving use did resolver
 * @param {string} did
 * @return {Promise<VerificationMethod[]>} verificationMethods
 */
export const didResolveGetVerificationMethods = async (did: string): Promise<VerificationMethod[]> => {
  const resp = await axios.get(resolverBaseURL + did).then((result) => result.data);
  const verificationMethods: VerificationMethod[] = resp.verificationMethod;
  return verificationMethods;
};

/*
export const didResolveGetEthVerificationMethods = async (did: string): Promise<VerificationMethod[]> => {
  const ethrDidResolver = getResolver(providerConfig);
  const didResolver = new Resolver(ethrDidResolver);
  const doc = await didResolver.resolve(did);
  const verificationMethods: VerificationMethod[] = doc.didDocument?.verificationMethod!;
  return verificationMethods;
};
*/

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
 * Extract claim from vc
 * @param { VerifiableCredential } vc
 * @return { Claim } claim
 */
const extractClaim = (vc: VerifiableCredential): Claim => {
  const claim: Claim = {
    "@context": vc["@context"],
    id: vc.id,
    type: vc.type,
    issuer: vc.issuer,
    issuanceDate: vc.issuanceDate,
    credentialSubject: vc.credentialSubject,
    credentialStatus: vc.credentialStatus,
  };
  return claim;
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
