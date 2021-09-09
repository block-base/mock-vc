import * as dotenv from "dotenv";
import { VerificationMethod } from "did-resolver";
import axios from "axios";

dotenv.config();

const resolverBaseURL = "https://dev.uniresolver.io/1.0/identifiers/";

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
