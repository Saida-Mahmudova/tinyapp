const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const existingUser = (users, email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const findIdByEmail = (users, email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

const checkPassword = (users, email, password) => {
  const id = findIdByEmail(users, email);
  for (let user in users) {
    if (user === id && users[id].password === password) {
      return true;
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

// GET /urls
app.get("/urls", (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

// POST /urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.includes('http')) {
    longURL = `http://${longURL}`;
  }
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`);
});

//GET /urls/new
app.get("/urls/new", (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//GET /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies['user_id'];
  let shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[req.params.shortURL], user };
  if (urlDatabase[shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Caution!!! Please check your URL list for the short URL.");
  }
});

// POST /urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.editedLongURL;
  res.redirect("/urls");
});

// GET /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
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
  if (existingUser(users, email)) {
    if (checkPassword(users, email, password)) {
      res.cookie('user_id', email);
      res.redirect('/urls');
    } else {
      res.status(403).send(`<html><body><h2>Error:403</h2> <h3><b>Password is not correct! Please check your password and try again!</h3><h4><a href="/login">Sign In</a></h4></b></body></html>`);
    }
  } else {
    res.status(403).send(`<html><body><h2>Error:403</h2> <h3><b>User ${email} is not registered. Please check your email or register!</h3><h4><a href="/register">Register</a></h4></b></body></html>`);
  }
});

//POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
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
  const password = req.body.password;
  const id = generateRandomString();
  const user = { email, password, id };
  if (email !== "" && password !== "") {
    if (!existingUser(users, email)) {
      users[id] = user;
      res.cookie("user_id", email);
      res.redirect('/urls');
    } else {
      res.status(400).send(`<html><body><h1>Error: 400</h1> <h2><b>This email(${email}) has already been registered!</h2><h3><a href="/login">Login</a></h3></b></body></html>`);
    }
  } else {
    res.status(400).send(`<html><body><h1>Error:400</h1> <h2><b>Email or Password cannot be left blank!</h2><h3><a href="/register">Register</a></h3></b></body></html>`);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});