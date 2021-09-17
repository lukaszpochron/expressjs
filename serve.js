const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');
const port = 8080;
const app = express();

app.use(cookieParser());
app.disable('x-powered-by');
const cookieMiddleware = (req, res, next) => {
// Middleware serving the static content depending on the cookie sent with the request.
// Prepare for serving each required static folder

const handler1 = express.static('./dist/en', { index: false })
const handler2 = express.static('./dist/pl', { index: false })
const handler3 = express.static('./dist/', { index: false })

const lang = req.cookies['mlang'];
  if (lang === 'en') {
    handler1(req, res, next);
  } else if(lang ==='pl') {
    handler2(req, res, next);
  }
  else {
    handler3(req,res,next);
  }
}

const defaultHeadersMiddleware = (req, res, next) => {
  res.append('X-Content-Type-Options', 'nosniff');
  res.append('X-Frame-Options', 'SAMEORIGIN');
  res.append('X-Xss-Protection', '1');
  res.append('Referrer-Policy', 'origin-when-cross-origin');
  res.append('X-Hello-World', 'hi there');
  next();
}

app.use(defaultHeadersMiddleware);
app.use(cookieMiddleware);

// Handle the root path by serving the right index.html at the root.
app.get('/', (req, res) => {
  res.append('X-Some-Important-Header', 'This can be used to apply headers to index.html specifically.');
  let lang = req.cookies['mlang'];
  // would be filtered by the list of allowed languages so access to the folder tree is restricted.
  if(!lang) lang = '';
  res.sendFile('index.html', { root: 'dist/' + lang })
});

// Language lookup - diagnostics
app.get('/checklang', (req, res) => {
  const lang = req.cookies['mlang'];
  console.log(lang)
  res.send(lang);
});

// cookie language "crud"
app.get('/polish', (req, res) => {
  res.cookie(`mlang`, `pl`, {
    maxAge: 5 * 60 * 1000, // = 5 minutes; Every browser—except Internet Explorer—uses it properly.
    expires: new Date('01 12 2021'), //Every browser that supports max-age will ignore the expires, probably don't use it at all.
    secure: true,
    httpOnly: true, // hides from devtools and makes unavailable for js.
  })
  res.send('Cookie /a/ have been saved successfully');
});

app.get('/english', (req, res) => {
  res.cookie(`mlang`, `en`, {
    maxAge: 5 * 60 * 1000, // = 5 minutes; Every browser—except Internet Explorer—uses it properly.
    expires: new Date('01 12 2021'), //Every browser that supports max-age will ignore the expires, probably don't use it at all.
    secure: true,
    httpOnly: true, // hides from devtools and makes unavailable for js.
  })
  res.send('Cookie /b/ have been saved successfully');
});

app.get('/getcookie', (req, res) => {
  //show the saved cookies
  console.log(req.cookies)
  res.send(req.cookies);
});

app.get('/deletecookie', (req, res) => {
  //show the saved cookies
  res.clearCookie()
  res.send('Cookie has been deleted successfully');
});

// "listen" handler
app.listen(port, () => {
  console.log("Server is listening on port " + port);
});

// We can add several attributes to make this cookie more secure:
// - HTTPonly ensures that a cookie is not accessible using the JavaScript code. This is the most crucial form of protection against cross-scripting attacks.
// - secure attribute ensures that the browser will reject cookies unless the connection happens over HTTPS.
// - sameSite attribute improves cookie security and avoids privacy leaks.
