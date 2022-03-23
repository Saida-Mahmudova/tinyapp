const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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


app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.includes('http')) {
    longURL = `http://${longURL}`
  }
  urlDatabase[shortURL] = longURL;
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  const templateVars = { shortURL, longURL: urlDatabase[req.params.shortURL] };
  if (urlDatabase[shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Caution!!! Please check your URL list for the short URL.")
  }
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});