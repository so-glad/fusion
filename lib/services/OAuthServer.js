
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _koaLog = require('koa-log4');

var _koaLog2 = _interopRequireDefault(_koaLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = _koaLog2.default.getLogger('fusion');

var OAuthServerService = function OAuthServerService(models) {
    var _this = this;

    _classCallCheck(this, OAuthServerService);

    this.models = null;

    this.saveToken = function (token, client, user) {
        var _models = _this.models,
            OAuthAccessToken = _models.OAuthAccessToken,
            OAuthRefreshToken = _models.OAuthRefreshToken;

        var accessToken = { id: token.accessToken, expiresAt: token.accessTokenExpiresAt, user_id: user.id, client_id: client.clientId };
        OAuthAccessToken.create(accessToken).then(function (savedToken) {
            logger.info('Saved access token [' + savedToken.id + '] for client[' + client.clientId + '], user[ ' + user.id + ' ].');
            if (token.refreshToken) {
                var refreshToken = { id: token.refreshToken, expiresAt: token.refreshTokenExpiresAt, access_token_id: token.accessToken };
                return OAuthRefreshToken.create(refreshToken);
            }
            return null;
        }).then(function (savedRefreshToken) {
            if (savedRefreshToken) {
                logger.info('Saved refresh token [' + savedRefreshToken.id + '] for access token [' + token.accessToken + '].');
            }
        }).catch(function (e) {
            return logger.error(e);
        });

        token.client = client;
        token.user = user;
        return token;
    };

    this.revokeToken = function (token) {
        var _models2 = _this.models,
            OAuthAccessToken = _models2.OAuthAccessToken,
            OAuthRefreshToken = _models2.OAuthRefreshToken;

        OAuthAccessToken.findByPrimary(token.accessToken).then(function (accessToken) {
            return accessToken.update({ revoked: true });
        }).then(function () {
            return OAuthRefreshToken.findByPrimary(token.refreshToken);
        }).then(function (refreshToken) {
            return refreshToken.update({ revoked: true });
        }).catch(function (e) {
            return logger.error(e);
        });
        return token;
    };

    this.getAccessToken = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(bearerToken) {
            var OAuthAccessToken, oauthToken;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            OAuthAccessToken = _this.models.OAuthAccessToken;
                            _context.prev = 1;
                            _context.next = 4;
                            return OAuthAccessToken.findOne({ where: { id: bearerToken, revoked: false } });

                        case 4:
                            oauthToken = _context.sent;
                            return _context.abrupt('return', {
                                accessToken: oauthToken.access_token,
                                clientId: oauthToken.client_id,
                                expires: oauthToken.expiresAt,
                                userId: oauthToken.user_id
                            });

                        case 8:
                            _context.prev = 8;
                            _context.t0 = _context['catch'](1);

                            logger.error(_context.t0);
                            return _context.abrupt('return', false);

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[1, 8]]);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    }();

    this.getRefreshToken = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(bearerToken) {
            var OAuthRefreshToken, refreshToken, accessToken;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            OAuthRefreshToken = _this.models.OAuthRefreshToken;
                            // access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id

                            _context2.prev = 1;
                            _context2.next = 4;
                            return OAuthRefreshToken.findByPrimary(bearerToken);

                        case 4:
                            refreshToken = _context2.sent;
                            _context2.next = 7;
                            return refreshToken.getAccessToken();

                        case 7:
                            accessToken = _context2.sent;
                            _context2.t0 = accessToken.id;
                            _context2.t1 = accessToken.expires_at;
                            _context2.next = 12;
                            return accessToken.getClient();

                        case 12:
                            _context2.t2 = _context2.sent;
                            _context2.next = 15;
                            return accessToken.getUser();

                        case 15:
                            _context2.t3 = _context2.sent;
                            _context2.t4 = bearerToken;
                            _context2.t5 = refreshToken.expires_at;
                            return _context2.abrupt('return', {
                                accessToken: _context2.t0,
                                accessTokenExpiresAt: _context2.t1,
                                client: _context2.t2,
                                user: _context2.t3,
                                refreshToken: _context2.t4,
                                refreshTokenExpiresAt: _context2.t5
                            });

                        case 21:
                            _context2.prev = 21;
                            _context2.t6 = _context2['catch'](1);

                            logger.error(_context2.t6);
                            return _context2.abrupt('return', false);

                        case 25:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this, [[1, 21]]);
        }));

        return function (_x2) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.getClient = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(clientId, clientSecret) {
            var OAuthClient, oauthClient, grants;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            OAuthClient = _this.models.OAuthClient;
                            _context3.prev = 1;
                            _context3.next = 4;
                            return OAuthClient.findOne({ where: { id: clientId, secret: clientSecret, revoked: false } });

                        case 4:
                            oauthClient = _context3.sent;
                            grants = [];

                            if ((1 & oauthClient.grantTypes) === 1) {
                                grants.push('password');
                            }
                            if ((2 & oauthClient.grantTypes) === 2) {
                                grants.push('client_credentials');
                            }
                            if ((4 & oauthClient.grantTypes) === 4) {
                                grants.push('refresh_token');
                            }
                            if ((8 & oauthClient.grantTypes) === 8) {
                                grants.push('authorization_code');
                            }
                            return _context3.abrupt('return', {
                                id: oauthClient.id,
                                clientId: oauthClient.id,
                                clientSecret: oauthClient.secret,
                                grants: grants
                            });

                        case 13:
                            _context3.prev = 13;
                            _context3.t0 = _context3['catch'](1);

                            logger.error(_context3.t0);
                            return _context3.abrupt('return', false);

                        case 17:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this, [[1, 13]]);
        }));

        return function (_x3, _x4) {
            return _ref3.apply(this, arguments);
        };
    }();

    this.getClientById = function () {
        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(clientId) {
            var OAuthClient;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            OAuthClient = _this.models.OAuthClient;
                            _context4.prev = 1;
                            _context4.next = 4;
                            return OAuthClient.findByPrimary(clientId);

                        case 4:
                            return _context4.abrupt('return', _context4.sent);

                        case 7:
                            _context4.prev = 7;
                            _context4.t0 = _context4['catch'](1);

                            logger.error(_context4.t0);
                            return _context4.abrupt('return', false);

                        case 11:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this, [[1, 7]]);
        }));

        return function (_x5) {
            return _ref4.apply(this, arguments);
        };
    }();

    this.getUser = function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(username, password) {
            var User, user;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            User = _this.models.User;
                            _context5.prev = 1;
                            _context5.next = 4;
                            return User.findOne({ where: { $or: [{ username: username }, { email: username }, { mobile: username }] } });

                        case 4:
                            user = _context5.sent;

                            if (!_bcrypt2.default.compareSync(password, user.password)) {
                                _context5.next = 7;
                                break;
                            }

                            return _context5.abrupt('return', user);

                        case 7:
                            return _context5.abrupt('return', false);

                        case 10:
                            _context5.prev = 10;
                            _context5.t0 = _context5['catch'](1);

                            logger.error(_context5.t0);
                            return _context5.abrupt('return', false);

                        case 14:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this, [[1, 10]]);
        }));

        return function (_x6, _x7) {
            return _ref5.apply(this, arguments);
        };
    }();

    this.models = models;
};

exports.default = OAuthServerService;