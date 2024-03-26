

var admin = require("firebase-admin");
const { initializeApp , applicationDefault } = require('firebase-admin/app');

var serviceAccount = require("../confidential/tasker-c0002-firebase-adminsdk-8di81-dca0fea737.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId:"tasker-c0002"
});

module.exports = admin