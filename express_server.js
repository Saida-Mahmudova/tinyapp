const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const generateRandomString = function () {
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += string[Math.floor(Math.random() * 62)];
  }
  return result;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// const existingUser = (users, email) => {
//   for (let user in users) {
//     if (users[user].email === email) {
//       return true;
//     }
//   }
//   return false;
// };

const findUserIdByEmail = (users, email) => {
  for (let id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return null;
};

const checkPassword = (users, email, password) => {
  const id = findUserIdByEmail(users, email);
  for (let user in users) {
    if (user === id && bcrypt.compareSync(password, users[id].password)) {
      return true;
    }
  }
  return false;
};
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

app.get("/", (req, res) => {
  res.redirect("/urls");
});

// GET /urls
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  let userEmail;
  if (userId) {
    userEmail = users[userId].email;
  }
  const newDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: newDatabase, user: userEmail };
  res.render("urls_index", templateVars);
});

// POST /urls
app.post("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  if (user) {
    const shortURL = generateRandomString();
    let longURL = req.body.longURL;
    if (!longURL.includes('http')) {
      longURL = `http://${longURL}`;
    }
    urlDatabase[shortURL] = { longURL: longURL, userId: userId };
    res.redirect(`urls/${shortURL}`);
  } else {
    res.status(404).send(`Error:404</n> Only logged in users can shorten the links!`);
  }

});

//GET /urls/new
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  let userEmail;
  if (!user) {
    res.redirect('/login')
  } else {
    userEmail = users[userId].email;
    const templateVars = { user: userEmail };
    res.render("urls_new", templateVars);
  }
});

//GET /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const newDatabase = urlsForUser(userId, urlDatabase);
  let shortURL = req.params.shortURL;
  if (user && newDatabase[shortURL]) {
    const templateVars = { shortURL, longURL: newDatabase[shortURL], user: user.email };
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/urls');
  }
});

// POST /urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const newDatabase = urlsForUser(userId, urlDatabase);
  if (user && newDatabase) {
    urlDatabase[shortURL].longURL = req.body.editedLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send(`<html><body><h2>Error:400</h2> <h3><b>Only logged in users can access this page! Please Login</h3><h4><a href="/login">Login</a></h4></b></body></html>`);
  }
});

// GET /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const user = users[userId];
  if (user) {
    let newDatabase = urlsForUser(userId, urlDatabase);
    if (newDatabase[shortURL]) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      res.status(400).send("<html><body><h2>Caution!</h2><h3><b>Check your URL list for the short URL.</b></h3></body></html> ")
    }
  } else {
    res.status(400).send('<html><body><h2>Caution!</h2> <h3><b>Please login for the short URL!</h3><h4><a href="/login">Sign In</a></h4></b></body></html>')
  }
});



//GET /login
app.get('/login', (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = { user };
  if (!user) {
    res.render('user_login', templateVars);
  } else {
    res.redirect('/urls');
  }
});

// POST login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = findUserIdByEmail(users, email);
  if (userId) {
    if (checkPassword(users, email, password)) {
      res.cookie('user_id', userId);
      res.redirect('/urls');
    } else {
      res.status(403).send(`<html><body><h2>Error:403</h2> <h3><b>Password is not correct! Please check your password and try again!</h3><h4><a href="/login">Sign In</a></h4></b></body></html>`);
    }
  } else {
    res.status(403).send(`<html><body><h2>Error:403</h2> <h3><b>User ${email} is not registered. Please check your email or register!</h3><h4><a href="/register">Register</a></h4></b></body></html>`);
  }
});



//GET /register
app.get('/register', (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { user };
  if (!user) {
    res.render('user_registration', templateVars);
  } else {
    res.redirect('/urls');
  }
});

//POST /register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();
  const user = { email, password, id };
  if (email !== "" && req.body.password !== "") {
    if (!findUserIdByEmail(users, email)) {
      users[id] = user;
      res.cookie("user_id", id);
      res.redirect('/urls');
    } else {
      res.status(400).send(`<html><body><h1>Error: 400</h1> <h2><b>This email(${email}) has already been registered!</h2><h3><a href="/login">Login</a></h3></b></body></html>`);
    }
  } else {
    res.status(400).send(`<html><body><h1>Error:400</h1> <h2><b>Email or Password cannot be left blank!</h2><h3><a href="/register">Register</a></h3></b></body></html>`);
  }
});
//POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});