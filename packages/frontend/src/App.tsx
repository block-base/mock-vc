import React from "react";
import axios from "axios";
import { EthrDID } from "ethr-did";

// DIDの秘密鍵と公開鍵のペアの作成
const keypair = EthrDID.createKeyPair();
const ethrDid = new EthrDID({ ...keypair });

function App() {
  const [did, setDid] = React.useState("");
  const [vc, setVc] = React.useState("");
  const [isVerified, setIsVerified] = React.useState(false);

  React.useEffect(() => {
    createDid();
  }, []);

  const createDid = () => {
    setDid(ethrDid.did);
  };

  const issue = async () => {
    const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/issue", { did });
    console.log(response.data.openbadgeV3);
    setVc(response.data.openbadgeV3);
  };

  const verify = async () => {
    const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/verify", { vc });
    setIsVerified(response.data.result);
  };
  return (
    <div className="App">
      <h2>DID</h2>
      <p>{did}</p>
      <h2>VCの発行・検証</h2>
      <button onClick={issue}>発行</button>
      <button onClick={verify}>検証</button>
      <h2>VCの表示</h2>
      {vc && <img src={vc} alt="vc" />}
      <h2>VCの検証結果</h2>
      <p>{isVerified && "ok"}</p>
    </div>
  );
}

export default App;
