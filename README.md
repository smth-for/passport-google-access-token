[![Banner](static/passportGoogleAccessToken.jpg)](https://smth.it)

[![npm version](https://img.shields.io/npm/v/@smth-for/passport-google-access-token.svg)](https://www.npmjs.com/package/@smth-for/passport-google-access-token)
[![Dependency Status](https://david-dm.org/smth-for/passport-google-access-token.svg)](https://david-dm.org/smth-for/passport-google-access-token)
[![devDependency Status](https://david-dm.org/smth-for/passport-google-access-token/dev-status.svg)](https://david-dm.org/smth-for/passport-google-access-token#info=devDependencies)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/smth-for/passport-google-access-token/issues)
[![Downloads](https://img.shields.io/npm/dm/@smth-for/passport-google-access-token.svg)](https://img.shields.io/npm/dm/@smth-for/passport-google-access-token.svg)
[![HitCount](http://hits.dwyl.com/smth-for/passport-google-access-token.svg)](http://hits.dwyl.com/smth-for/passport-google-access-token)

# passport-google-access-token

[Passport](http://passportjs.org/) strategy for authenticating with [Google](http://www.google.com/) access tokens using the OAuth 2.0 API.

This module lets you authenticate using google in your Node.js applications.
By plugging into Passport, google authentication can be easily and unobtrusively integrated into any application or framework that supports [Express](http://expressjs.com/).

## Installation

```shell
npm install @smth-for/passport-google-access-token
```

## Usage

### Configure Strategy

The google authentication strategy authenticates users using a google account and OAuth 2.0 tokens.
The strategy requires a `verify` callback, which accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID and app secret.

```js
const GoogleTokenStrategy = require('passport-google-token');

passport.use(new GoogleTokenStrategy({
    clientID: google_APP_ID,
    clientSecret: google_APP_SECRET,
  }, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({googleId: profile.id}, function (error, user) {
      return done(error, user);
    });
  }
));
```

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'google-token'` strategy, to authenticate requests.

```js
app.post('/auth/google/token',
  passport.authenticate('google-token'),
  function (req, res) {
    // do something with req.user
    res.send(req.user? 200 : 401);
  }
);
```

Or using Sails framework:

```javascript
// api/controllers/AuthController.js
module.exports = {
  google: function(req, res) {
    passport.authenticate('google-token', function(error, user, info) {
      // do stuff with user
      res.ok();
    })(req, res);
  }
};
```

### Client Requests

Clients can send requests to routes that use passport-google-token authentication using query params, body, or HTTP headers.
Clients will need to transmit the `access_token` and optionally the `refresh_token` that are received from google after login.

#### Sending access_token as a Query parameter

```shell
GET /auth/google/token?access_token=<TOKEN_HERE>
```

#### Sending access token as an HTTP header

Clients can choose to send the access token using the Oauth2 Bearer token (RFC 6750) compliant format.

```shell
GET /resource HTTP/1.1
Host: server.example.com
Authorization: Bearer base64_access_token_string
```

Optionally a client can send via a custom (default access_token) header.

```shell
GET /resource HTTP/1.1
Host: server.example.com
access_token: base64_access_token_string
```

#### Sending access token as an HTTP body

Clients can transmit the access token via the body

```shell
POST /resource HTTP/1.1
Host: server.example.com

access_token=base64_access_token_string
```
## Join SMTH Community
![Discord Banner 2](https://discordapp.com/api/guilds/748546400631128204/widget.png?style=banner2)

[INVITATION LINK](https://discord.gg/H6NkzZy)

## Code of Conduct
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

## License

[MIT License](LICENCE)

## Special Thanks

- [Nicholas Penree](https://github.com/drudge)
- [Jared Hanson](https://github.com/jaredhanson)
- [Eugene Obrezkov](https://github.com/ghaiklor)

