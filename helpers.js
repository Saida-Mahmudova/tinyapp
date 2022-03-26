const getUserByEmail = (users, email) => {
  for (let id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return undefined;
};

module.exports = getUserByEmail;