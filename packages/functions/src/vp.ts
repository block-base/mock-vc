import { didResolveGetVerificationMethods } from "./utils";
import { verifyJWS, initJWSObj } from "./did-jws";
import * as stream from "stream";
import * as pngitxt from "png-itxt";
import { Buffer } from "buffer";

export const verifyVP = async (vp: VerifiablePresentation): Promise<boolean> => {
  const claim = extractVpClaim(vp);
  const verificationMethod = await didResolveGetVerificationMethods(vp.proof.verificationMethod);
  return verifyJWS(initJWSObj(vp.proof.jws), claim, verificationMethod);
};

/**
 * getVcFromBuf from Buffer
 * @param { Buffer } buf
 * @return { Promise<VerifiableCredential> } vc
 */
export const getVpFromBuf = async (buf: Buffer): Promise<VerifiablePresentation> => {
  let vp: VerifiablePresentation = vpInit();
  return new Promise((resolve) => {
    const readable = new stream.Readable();
    readable.push(buf);
    readable.push(null);
    readable.pipe(
      pngitxt.get("openbadges", (err, buf) => {
        if (!err && buf) {
          vp = JSON.parse(buf.value);
          resolve(vp);
        } else {
          console.error("Please input PNG file!");
        }
      })
    );
  });
};

/**
 * Extract claim from vc
 * @param { VerifiablePresentation } vp
 * @return { VPClaim } vpClaim
 */
const extractVpClaim = (vp: VerifiablePresentation): VPClaim => {
  const vpClaim: VPClaim = {
    "@context": vp["@context"],
    type: vp.type,
    verifiableCredential: vp.verifiableCredential,
  };
  return vpClaim;
};

/**
 * Initialize verifiable credentials
 * @return { VerifiableCredential } vc
 */
const vpInit = (): VerifiablePresentation => {
  const vp: VerifiablePresentation = {
    "@context": [],
    type: "",
    verifiableCredential: [],
    proof: {
      type: "",
      created: new Date().toISOString(),
      proofPurpose: "",
      verificationMethod: "",
      domein: "",
      jws: "",
    },
  };
  return vp;
};
