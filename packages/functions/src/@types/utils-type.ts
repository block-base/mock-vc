interface VerifiablePresentation extends VPClaim {
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    domein: string;
    jws: string;
  };
}

interface VPClaim {
  "@context": string[];
  type: string;
  verifiableCredential: VerifiableCredential[];
}

interface VerifiableCredential extends VCClaim {
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
  results?: {
    resultDescription: string;
    achieveLevel: string;
  }[];
}

interface VCClaim {
  "@context": string[];
  id: string;
  type: string[];
  issuer: {
    id: string;
    name?: string;
    image?: string;
    url?: string;
    email?: string;
  };
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  credentialStatus?: {
    id: string;
    type: string;
  };
}

interface CredentialSubject {
  id: string;
  achievement: {
    id: string;
    type: string;
    name: string;
    description: string;
    image: string;
    issuedOn: string;
    achievementType: string;
    creater: string;
    criteria?: {
      narrative: string;
    };
  };
  tags?: string[];
  alignment?: {
    targetName: string;
    targetUrl: string;
    targetDescription: string;
    targetCode: string;
  }[];
}

interface JWS {
  Header: string;
  Payload: string;
  Signature: string;
}
