const { OAuth2Strategy, InternalOAuthError } = require('passport-oauth');
const { URL } = require('url');
const crypto = require('crypto');

/**
 * `GoogleTokenStrategy` constructor.
 *
 * The Google authentication strategy authenticates requests by delegating to
 * Google using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `error` should be set.
 *
 * @param {Object} options
 * @param {Function} verify
 * @example
 * passport.use(new GoogleTokenStrategy({
 *   clientID: '123456789',
 *   clientSecret: 'shh-its-a-secret'
 * }), (accessToken, refreshToken, profile, done) => {
 *   User.findOrCreate({googleId: profile.id}, done);
 * });
 */
module.exports = class GoogleTokenStrategy extends OAuth2Strategy {
  constructor (_options, _verify) {
    const options = _options || {};
    const verify = _verify;
    const _gApiVersion = options.gApiVersion || 'v3';

    options.authorizationURL = options.authorizationURL || `https://accounts.google.com/o/oauth2/auth`;
    options.tokenURL = options.tokenURL || `https://accounts.google.com/o/oauth2/token`;

    super(options, verify);

    this.name = 'google-token';
    this._codeField = options.codeField || 'code';
    this._accessTokenField = options.accessTokenField || 'access_token';
    this._refreshTokenField = options.refreshTokenField || 'refresh_token';
    this._profileURL = options.profileURL || `https://www.googleapis.com/oauth2/${_gApiVersion}/userinfo`;
    this._passReqToCallback = options.passReqToCallback;
    this._oauth2.useAuthorizationHeaderforGET(false);
    this._gApiVersion = _gApiVersion;
  }

  /**
   * Authenticate request by delegating to a service provider using OAuth 2.0.
   * @param {Object} req
   * @param {Object} options
   */
  authenticate(req, _options) {
    const accessToken = this.lookup(req, this._accessTokenField);
    const refreshToken = this.lookup(req, this._refreshTokenField);

    if (!accessToken) return this.fail({ message: `You should provide ${this._accessTokenField}` });

      this._loadUserProfile(accessToken, (error, profile) => {
        if (error) return this.error(error);

        const verified = (error, user, info) => {
          if (error) return this.error(error);
          if (!user) return this.fail(info);

          return this.success(user, info);
        };

        if (this._passReqToCallback) {
          this._verify(req, accessToken, refreshToken, profile, verified);
        } else {
          this._verify(accessToken, refreshToken, profile, verified);
        }
      });
  }

  /**
   * Retrieve user profile from Google.
   *
   * This function constructs a normalized profile, with the following properties:
   *
   *   - `provider`         always set to `google`
   *   - `id`               the user's Google ID
   *   - `username`         the user's Google username
   *   - `displayName`      the user's full name
   *   - `name.familyName`  the user's last name
   *   - `name.givenName`   the user's first name
   *   - `name.middleName`  the user's middle name
   *   - `gender`           the user's gender: `male` or `female`
   *   - `profileUrl`       the URL of the profile for the user on Google
   *   - `emails`           the contact email address granted by the user
   *
   * @param {String} accessToken
   * @param {Function} done
   */
  userProfile (accessToken, done) {
    let profileURL = new URL(this._profileURL);

    profileURL = profileURL.toString();

    this._oauth2.get(profileURL, accessToken, (error, body, _res) => {
      if (error) return done(new InternalOAuthError('Failed to fetch user profile', error));

      try {
        const json = JSON.parse(body);

        const profile = {
          provider: 'google',
          id: json.sub,
          displayName: json.name || '',
          name: {
            familyName: json.family_name || '',
            givenName: json.given_name || '',
            middleName: json.middle_name || ''
          },
          gender: json.gender || '',
          emails: [{
            value: json.email || ''
          }],
          photos: [{
            value: json.picture || ''
          }],
          _raw: body,
          _json: json
        };

        done(null, profile);
      } catch (e) {
        done(e);
      }
    });
  }

  /**
   * Parses an OAuth2 RFC6750 bearer authorization token, this method additionally is RFC 2616 compliant and respects
   * case insensitive headers.
   *
   * @param {Object} req http request object
   * @returns {String} value for field within body, query, or headers
   */
  parseOAuth2Token (req) {
    const OAuth2AuthorizationField = 'Authorization';
    const headerValue = (req.headers && (req.headers[OAuth2AuthorizationField] || req.headers[OAuth2AuthorizationField.toLowerCase()]));

    return (
      headerValue && (() => {
        const bearerRE = /Bearer (.*)/;
        const match = bearerRE.exec(headerValue);
        return (match && match[1]);
      })()
    );
  }

  /**
   * Performs a lookup of the param field within the request, this method handles searching the body, query, and header.
   * Additionally this method is RFC 2616 compliant and allows for case insensitive headers. This method additionally will
   * delegate outwards to the OAuth2Token parser to validate whether a OAuth2 bearer token has been provided.
   *
   * @param {Object} req http request object
   * @param {String} field
   * @returns {String} value for field within body, query, or headers
   */
  lookup (req, field) {
    return (
      (req.body && req.body[field]) ||
      (req.query && req.query[field]) ||
      (req.headers && (req.headers[field] || req.headers[field.toLowerCase()])) ||
      this.parseOAuth2Token(req)
    );
  }
};
