const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, checkPassword, urlsForUser, existingUrl } = require('./helpers');


app.use(cookieSession({
  name: 'session',
  keys: ["LHL", "Saida", "TinyApp"],
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");



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



app.get("/", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// GET /urls
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  let userEmail;
  if (userId) {
    userEmail = users[userId].email;
  }
  const newDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: newDatabase, user: userEmail };
  res.render("urls_index", templateVars);
});

//GET /urls/new
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let userEmail;
  if (!user) {
    res.redirect('/login');
  } else {
    userEmail = users[userId].email;
    const templateVars = { user: userEmail };
    res.render("urls_new", templateVars);
  }
});

//GET /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
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

// GET /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// POST /urls
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const newDatabase = urlsForUser(userId, urlDatabase);
  let longURL = req.body.longURL;
  if (!longURL.includes('http')) {
    longURL = `http://${longURL}`;
  }
  console.log("newDatabase", newDatabase)
  console.log("existingUrl(req.body.editedLongURL, newDatabase)", existingUrl(longURL, newDatabase))
  console.log("edited", longURL)
  if (user && !existingUrl(longURL, newDatabase)) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: longURL, userId: userId };
    res.redirect(`urls/${shortURL}`);
  } else if (!user) {
    res.status(400).send(`<html><body style ="text-align:center"><h1 style="color:#28a745">Error:400</h1> <h2><b>Please Login</h2><h2><a href="/login" style ="color:#6c757d">Login</a></h2></b></body></html>`);
  } else {
    res.status(400).send(`<html><body style ="text-align:center"><h1 style="color:#28a745">Error:400</h1> <h2><b>This URL exists in your list!</h2><h2><a href="/urls/new" style = "color:#6c757d">Go Back</a></h2></b></body></html>`);
  }
});

// POST /urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const user = users[userId];
  const newDatabase = urlsForUser(userId, urlDatabase);
  if (user && !existingUrl(req.body.editedLongURL, newDatabase)) {
    urlDatabase[shortURL].longURL = req.body.editedLongURL;
    res.redirect("/urls");
  } else if (!user) {
    res.status(400).send(`<html><body style ="text-align:center"><h1 style="color:#28a745">Error:400</h1> <h2><b>Please Login</h2><h2><a href="/login" style ="color:#6c757d">Login</a></h2></b></body></html>`);
  } else {
    res.status(400).send(`<html><body style ="text-align:center"><h1 style="color:#28a745">Error:400</h1> <h2><b>This URL exists in your list!</h2><h2><a href="/urls/new" style = "color:#6c757d">Go Back</a></h2></b></body></html>`);
  }
});

//POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    let newDatabase = urlsForUser(userId, urlDatabase);
    if (newDatabase[shortURL]) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      res.status(400).send(`<html><body style ="text-align:center"><h1 style="color:#28a745">Caution!</h1> <h2><b>Check your URL list for the short URL.</h2></b></body></html>`);
    }
  } else {
    res.status(400).send(`<html><body style ="text-align:center"><h1 style="color:#28a745">Caution!</h1> <h2><b>Please login for the short URL!</h2><h2><a href="/login" style = "color:#6c757d">Login</a></h2></b></body></html>`);
  }
});



//GET /login
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user };
  if (!user) {
    res.render('user_login', templateVars);
  } else {
    res.redirect('/urls');
  }
});

//GET /register
app.get('/register', (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user };
  if (!user) {
    res.render('user_registration', templateVars);
  } else {
    res.redirect('/urls');
  }
});

// POST login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = getUserByEmail(users, email);
  if (userId) {
    if (checkPassword(users, email, password)) {
      req.session.user_id = userId;
      res.redirect('/urls');
    } else {
      res.status(403).send(`<html><body style ="text-align:center"><h1 style="color:#28a745">Error:403</h1> <h2><b>Password is not correct! Please check your password and try again!</h2><h2><a href='/login' style = 'color:#6c757d'>Login</a></h2></b></body></html>`);
    }
  } else {
    res.status(403).send(`<html><body style="text-align:center"><h1 style="color:#28a745">Error:403</h1> <h2><b>User ${email} is not registered. Please check your email or register!</h2><h2><a href="/register" style="color:#6c757d">Register</a></h2></b></body></html>`);
  }
});

//POST /register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();
  const user = { email, password, id };
  if (email !== "" && req.body.password !== "") {
    if (!getUserByEmail(users, email)) {
      users[id] = user;
      req.session.user_id = id;
      res.redirect('/urls');
    } else {
      res.status(400).send(`<html><body style ="text-align:center"><h1 style="color:#28a745">Error: 400</h1><h2><b>This email ${email} has already been registered!</h2><h2><a href="/login" style = "color:#6c757d">Login</a></h2></b></body></html>`);
    }
  } else {
    res.status(400).send(`<html><body style="text-align:center"><h1 style="color:#28a745">Error: 400</h1><h2><b>Email or Password cannot be left blank!</h2><h2><a href='/register' style ="color:#6c757d">Register</a></h2></b></body></html>`);
  }
});
//POST /logout
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});