import React from "react";
import { VerifiableCredential } from "../@types/utils-type";

import "./Info.css";

interface Props {
  vc: VerifiableCredential;
}

const VCInfo = (props: Props) => {
  return (
    <div className="vc-info">
      <div>
        <table>
          <thead>
            <tr>
              <th>VC Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>@Context</td>
              <td>{props.vc["@context"]}</td>
            </tr>
            <tr>
              <td>id</td>
              <td>{props.vc.id}</td>
            </tr>
            <tr>
              <td>type</td>
              <td>{props.vc.type}</td>
            </tr>
            <tr>
              <td>Issuer ID</td>
              <td>{props.vc.issuer.id}</td>
            </tr>
            <tr>
              <td>IssuanceDate</td>
              <td>{props.vc.issuanceDate}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <br />
      <div>
        <table>
          <thead>
            <tr>
              <th>Credential Subject</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ID</td>
              <td>{props.vc.credentialSubject.achievement.id}</td>
            </tr>
            <tr>
              <td>タイプ</td>
              <td>{props.vc.credentialSubject.achievement.type}</td>
            </tr>
            <tr>
              <td>アチーブメントタイプ</td>
              <td>{props.vc.credentialSubject.achievement.achievementType}</td>
            </tr>
            <tr>
              <td>名前</td>
              <td>{props.vc.credentialSubject.achievement.name}</td>
            </tr>
            <tr>
              <td>詳細</td>
              <td>{props.vc.credentialSubject.achievement.description}</td>
            </tr>
            <tr>
              <td>作成日</td>
              <td>{props.vc.credentialSubject.achievement.issuedOn}</td>
            </tr>
            <tr>
              <td>作成者</td>
              <td>{props.vc.credentialSubject.achievement.creater}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default VCInfo;
