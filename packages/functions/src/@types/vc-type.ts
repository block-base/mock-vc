interface CredentialSubject {
  id: string;
  hasCredential: {
    id: string;
    type: string;
    name: string;
    description: string;
    image: string;
    issuedOn: string;
    achievementType: string;
    creater: string;
    criteria: {
      narrative: string;
    };
  };
}
