import * as didJWT from "did-jwt";
import { VerificationMethod } from "did-resolver";
import base64url from "base64url";

import { JWS, VCClaim } from "../@types/utils-type";

/**
 * Create JWS
 * @param {string} payload
 * @param {string} privatekey
 * @return {Promise<JWS>} jwsObj
 */
export const CreateJWS = async (payload: string, privatekey: string): Promise<JWS> => {
  const signer = didJWT.ES256KSigner(privatekey);
  const jws = didJWT.createJWS(payload, signer);
  const jwsObj = initJWSObj(await jws);
  return jwsObj;
};
/**
 * Verify JWS - JWSが有効かどうかを返します
 * @param { JWS } jws jwsオブジェクト
 * @param { Claim } claim 署名したJSON-LD
 * @param { VerificationMethod[] } verificationMethods
 * @return { Promise<boolean> } true or false
 */
export const verifyJWS = async (
  jws: JWS,
  claim: VCClaim,
  verificationMethods: VerificationMethod[]
): Promise<boolean> => {
  jws.Payload = base64url(JSON.stringify(claim));
  const jwsstr = JWSObjToStr(jws);
  let pubKey: VerificationMethod;
  try {
    pubKey = didJWT.verifyJWS(jwsstr, verificationMethods);
    return pubKey ? true : false;
  } catch (err) {
    return false;
  }
};

/**
 * initJWS init JWS Object
 * @param {string} jws
 * @return {JWS} jwsObj
 */
export const initJWSObj = (jws: string): JWS => {
  const reg = /^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]*)\.([a-zA-Z0-9_-]+)$/;
  const j = reg.exec(jws);
  const jwsObj: JWS = {
    Header: "",
    Payload: "",
    Signature: "",
  };
  if (j?.length !== 4) {
    console.error("Couldn't Create JWS");
  } else {
    const jwsObj: JWS = {
      Header: j[1],
      Payload: j[2],
      Signature: j[3],
    };
    return jwsObj;
  }
  return jwsObj;
};

/**
 * JWSObjToStr JWS オブジェクトのheader,payload,signatureを連結しstringで返します
 * @param {JWS} jws
 * @return {string} jwsStr
 */
export const JWSObjToStr = (jws: JWS): string => {
  const jwsStr = jws.Header + "." + jws.Payload + "." + jws.Signature;
  return jwsStr;
};

/**
 * JWSObjToStrWithoutPayload JWS オブジェクトのheader,signatureを連結しstringで返します
 * @param {JWS} jws
 * @return {string} jwsStr
 */
export const JWSObjToStrWithoutPayload = (jws: JWS): string => {
  const jwsStr = jws.Header + ".." + jws.Signature;
  return jwsStr;
};
