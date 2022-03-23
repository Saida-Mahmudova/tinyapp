const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

const generateRandomString = function () {
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += string[Math.floor(Math.random() * 62)];
  }
  return result;
}



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls", (req, res) => {
  const user = req.cookies.username;
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.includes('http')) {
    longURL = `http://${longURL}`
  }
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies.username;
  const templateVars = { user }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies.username;
  let shortURL = req.params.shortURL
  const templateVars = { shortURL, longURL: urlDatabase[req.params.shortURL], user };
  if (urlDatabase[shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Caution!!! Please check your URL list for the short URL.")
  }
});


app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.editedLongURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  const user = req.cookies.username;
  const templateVars = { user }
  console.log(templateVars)
  if (!user) {
    res.render('urls_login', templateVars)
  } else {
    res.redirect('/urls');
  }
})

// POST login
app.post("/login", (req, res) => {
  const user = req.body.username;
  res.cookie("username", user)
  res.redirect('/urls')
});

//POST /logout

app.post('/logout', (req, res) => {
  const user = req.body.username;
  res.clearCookie("username", user)
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});