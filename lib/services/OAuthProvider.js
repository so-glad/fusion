
'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OAuthProviderService = function OAuthProviderService(_ref) {
    var _this = this;

    var models = _ref.models,
        oauthClient = _ref.oauthClient,
        handlers = _ref.handlers;

    _classCallCheck(this, OAuthProviderService);

    this.oauthClient = null;
    this.models = null;
    this.handlers = null;

    this.findProvider = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(type, client) {
            var OAuthProvider;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            OAuthProvider = _this.models.OAuthProvider;
                            _context.next = 3;
                            return OAuthProvider.findOne({ where: { type: type, clientId: client } });

                        case 3:
                            return _context.abrupt('return', _context.sent);

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function (_x, _x2) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.connectProviderUser = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(type, client, code) {
            var provider, providerClient, accessToken, handler;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return _this.findProvider(type, client);

                        case 2:
                            provider = _context2.sent;

                            /* clientId, clientSecret, baseSite, authorizePath, accessTokenPath, customHeaders */
                            providerClient = new _this.oauthClient.OAuth2(provider.clientId, provider.clientSecret, 'https://api.twitter.com/', provider.authorizeUrl, provider.tokenUrl, {});
                            _context2.next = 6;
                            return providerClient.getOAuthAccessToken(code, {});

                        case 6:
                            accessToken = _context2.sent;
                            handler = _this.handlers[type];
                            //TODO To connect provider via provider.tokenUrl, and sync user info locally.

                            _context2.next = 10;
                            return handler.getUser(accessToken);

                        case 10:
                            return _context2.abrupt('return', _context2.sent);

                        case 11:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this);
        }));

        return function (_x3, _x4, _x5) {
            return _ref3.apply(this, arguments);
        };
    }();

    this.models = models;
    this.oauthClient = oauthClient;
    this.handlers = handlers;
};

exports.default = OAuthProviderService;