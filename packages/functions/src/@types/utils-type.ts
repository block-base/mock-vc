interface VerifiableCredential {
  "@context": Array<string>;
  id: string;
  type: Array<string>;
  issuer: string;
  issuanceDate: Date;
  credentialSubject: CredentialSubject;
  credentialStatus: {
    id: string;
    type: string;
  };
  proof: {
    type: string;
    created: Date;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
}

interface CredentialSubject {
  id: string;
  hasCredential: {
    id: string;
    type: string;
    name: string;
    description: string;
    image: string;
    issuedOn: Date;
    achievementType: string;
    creater: string;
    criteria: {
      narrative: string;
    };
  };
}

interface JWS {
  Header: string;
  Payload?: string;
  Signature: string;
}
