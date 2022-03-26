const bcrypt = require('bcryptjs');
// find user by given email
const getUserByEmail = (users, email) => {
  for (let id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return undefined;
};

//generating 6digit random string both for shortURL and userId
const generateRandomString = () => {
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += string[Math.floor(Math.random() * 62)];
  }
  return result;
};

// compare given password with password in database
const checkPassword = (users, email, password) => {
  const id = getUserByEmail(users, email);
  for (let user in users) {
    if (user === id && bcrypt.compareSync(password, users[id].password)) {
      return true;
    }
  }
  return false;
};

//function for letting users keep their own urls
const urlsForUser = (id, urlDatabase) => {
  const obj = {};
  if (id !== undefined) {
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userId === id) {
        obj[shortURL] = urlDatabase[shortURL].longURL;
      }
    }
  }
  return obj;
};

//check if url is existing in database
const existingUrl = (url, urlDatabase) => {
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL] === url) {
      return true;
    }
  }
  return false;
};

module.exports = { getUserByEmail, generateRandomString, checkPassword, urlsForUser, existingUrl };