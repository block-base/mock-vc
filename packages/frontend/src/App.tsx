import React from "react";
import axios from "axios";

function App() {
  const [did, setDid] = React.useState("");
  const [vc, setVc] = React.useState("");
  const [isVerified, setIsVerified] = React.useState(false);

  React.useEffect(() => {
    createDid();
  }, []);

  // TODO: Did作る
  const createDid = () => {
    setDid("did:ethr:0xB1A25D6E37ad12579801eBb6787636fd63ba87cc");
  };

  const issue = async () => {
    const response = await axios.post("http://localhost:5001/blockbase-vcmock-prod/us-central1/issue", { did });

    setVc(response.data.vc);
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
