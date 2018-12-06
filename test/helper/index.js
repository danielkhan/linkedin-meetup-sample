const fs = require('fs');
const path = require('path');
const util = require('util');

const db = require('../../server/lib/db');
const UserModel = require('../../server/models/UserModel');

let AvatarService = null;
try {
  AvatarService = require('../../server/services/AvatarService');
} catch (err) {
  console.log('Avatars ignored');
}
const config = require('../../server/config').test;

const fsReaddir = util.promisify(fs.readdir);
const fsUnlink = util.promisify(fs.unlink);

async function deleteFilesInDir(directory) {
  const files = await fsReaddir(directory);
  const fileProm = [];
  files.forEach((file) => {
    fileProm.push(fsUnlink(path.join(directory, file)));
  });

  return Promise.all(fileProm);
}

module.exports.UserModel = UserModel;
module.exports.AvatarService = AvatarService;
module.exports.config = config;

module.exports.validUser = {
  username: 'Frank',
  email: 'frank@acme.org',
  password: 'verysecret',
};

module.exports.before = async () => {
  await db.connect(config.database.dsn);
  return UserModel.deleteMany({});
};

module.exports.after = async () => {
  await UserModel.deleteMany({});
  deleteFilesInDir(config.data.avatars);
};

// Local helper function that creates a user
module.exports.createUser = async (agent, user) => agent
  .post('/users/registration')
  .set('content-type', 'application/x-www-form-urlencoded')
  .send(user);

// Local helper function that logs a user in
module.exports.loginUser = async (agent, email, password) => agent
  .post('/users/login')
  .set('content-type', 'application/x-www-form-urlencoded')
  .send({ email, password });
