import * as didJWT from "did-jwt";

/**
 * Create JWS
 * @param {string} payload
 * @param {string} privatekey
 * @return {Promise<JWS>} jwsObj
 */
export const CreateJWS = async (payload: string, privatekey: string): Promise<JWS> => {
  const signer = didJWT.ES256KSigner(privatekey);
  const jws = didJWT.createJWS(payload, signer);
  const jwsObj = initJWS(await jws);
  return jwsObj;
};

/**
 * initJWS init JWS Object
 * @param {string} jws
 * @return {JWS} jwsObj
 */
const initJWS = (jws: string): JWS => {
  const reg = /^(.+?)\.(.+?)\.(.+)/;
  const j = reg.exec(jws)!;
  const jwsObj: JWS = {
    Header: j[1],
    Payload: j[2],
    Signature: j[3],
  };
  return jwsObj;
};
