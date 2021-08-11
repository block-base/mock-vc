import * as functions from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const issue = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const verify = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
  });
  