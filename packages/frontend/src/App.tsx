import React from "react";
import axios from "axios";
import { EthrDID } from "ethr-did";

import { createVP, getVC } from "./utils/utils";
import VCInfo from "./components/VCInfo";

import "./App.css";
import { VerifiableCredential } from "./@types/utils-type";

// DIDの秘密鍵と公開鍵のペアの作成
const keypair = EthrDID.createKeyPair();
const ethrDid = new EthrDID({ ...keypair });

function App() {
  const [did, setDid] = React.useState("");
  const [base64Vc, setbase64Vc] = React.useState("");
  const [vc, setVc] = React.useState<VerifiableCredential>({
    "@context": [],
    id: "",
    type: [],
    issuer: {
      id: "",
    },
    issuanceDate: "",
    credentialSubject: {
      id: "",
      achievement: {
        id: "string",
        type: "string",
        name: "string",
        description: "string",
        image: "string",
        issuedOn: "string",
        achievementType: "string",
        creater: "string",
      },
    },
    proof: {
      type: "string",
      created: "string",
      proofPurpose: "string",
      verificationMethod: "string",
      jws: "string",
    },
  });
  const [vcIsVerified, setVcIsVerified] = React.useState(false);
  const [vpIsVerified, setVpIsVerified] = React.useState(false);

  React.useEffect(() => {
    createDid();
  }, []);

  const createDid = () => {
    setDid(ethrDid.did);
  };

  const issue = async () => {
    const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/issue", { did });
    const vcData = await getVC(response.data.vc);
    setbase64Vc(response.data.vc);
    setVc(vcData);
  };

  const verify = async () => {
    if (base64Vc !== "") {
      const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/verify", {
        vc: base64Vc,
      });
      setVcIsVerified(response.data.result);
    }
  };

  // 一つのVCのみをVPにする
  const present = async () => {
    if (base64Vc !== "") {
      const vp = await createVP(vc, keypair.privateKey, did);
      const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/present", { vp });
      setVpIsVerified(response.data.result);
    }
  };

  return (
    <div className="App">
      <h2>Learner DID</h2>
      <p>{did}</p>
      <hr />
      <h2>VCの発行</h2>
      <button onClick={issue}>発行</button>
      <h2>VCの表示</h2>
      {base64Vc && <img src={base64Vc} alt="vc" width="500" height="auto" />}
      {base64Vc && <VCInfo vc={vc} />}
      <h2>VCの検証</h2>
      <button onClick={verify}>VC検証</button>
      <h3>VCの検証結果</h3>
      <p>{vcIsVerified && "ok"}</p>
      <hr />
      <h2>VPの検証</h2>
      <button onClick={present}>VP検証</button>
      <h3>VPの検証結果</h3>
      <p>{vpIsVerified && "ok"}</p>
    </div>
  );
}

export default App;
