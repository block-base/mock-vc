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
  const [base64Vcs, setbase64Vc] = React.useState<string[]>([]);
  const [vc, setVC] = React.useState<VerifiableCredential[]>([]);
  const [vcIsVerified, setVcIsVerified] = React.useState<boolean[]>([]);
  const [vpIsVerified, setVpIsVerified] = React.useState(false);

  React.useEffect(() => {
    createDid();
  }, []);

  const createDid = () => {
    setDid(ethrDid.did);
  };

  const issueGraduateCertification = async () => {
    const response = await axios.post(
      "http://localhost:5001/blockbase-vcmock-prod/us-central1/issueGraduateCertification",
      { did }
    );
    setbase64Vc([...base64Vcs, response.data.vc]);
    setVC([...vc, await getVC(response.data.vc)]);
  };

  const issueStudentCard = async () => {
    const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/issueStudentCard", {
      did,
    });
    setbase64Vc([...base64Vcs, response.data.vc]);
    setVC([...vc, await getVC(response.data.vc)]);
  };

  const verify = async (index: number) => {
    if (vc !== []) {
      const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/verify", {
        vc: base64Vcs[index],
      });
      const vcIsVerifiedTmp = [...vcIsVerified];
      vcIsVerifiedTmp[index] = response.data.result;
      setVcIsVerified(vcIsVerifiedTmp);
    }
  };

  // VCをVPにする
  const present = async () => {
    if (vc !== []) {
      const vp = await createVP(vc, keypair.privateKey, did);
      const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/present", { vp });
      setVpIsVerified(response.data.result);
      console.log(vp);
    }
  };

  const vcItems = (base64Vcs: string[]) => {
    if (vc.length === base64Vcs.length) {
      return (
        <ul>
          {base64Vcs.map((base64Vc, index) => (
            <li key={index}>
              No.{index + 1}
              <img src={base64Vc} alt="vc" width="auto" height="300" />
              <VCInfo vc={vc[index]} />
              <div>
                <h2>VCの検証</h2>
                <button onClick={() => verify(index)}>VC検証</button>
                <h3>VCの検証結果</h3>
                <p>{vcIsVerified[index] ? "ok" : ""}</p>
              </div>
            </li>
          ))}
        </ul>
      );
    } else {
      return;
    }
  };

  return (
    <div className="App">
      <h2>Learner DID</h2>
      <p>{did}</p>
      <hr />
      <h2>VCの発行</h2>
      <button onClick={issueGraduateCertification}>卒業証明書発行</button>
      <button onClick={issueStudentCard}>学生証発行</button>
      <h2>VCの表示</h2>
      {base64Vcs && vcItems(base64Vcs)}
      <hr />
      <h2>VPの検証</h2>
      <button onClick={present}>VP検証</button>
      <h3>VPの検証結果</h3>
      <p>{vpIsVerified && "ok"}</p>
    </div>
  );
}

export default App;
