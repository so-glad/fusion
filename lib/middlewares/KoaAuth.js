
'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KoaAuth = function KoaAuth(oauthServer) {
    var _this = this;

    _classCallCheck(this, KoaAuth);

    this.oauthServer = null;

    this.login = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return _this.oauthServer.token(ctx, _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                                var user;
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                if (!(ctx.state.oauth && ctx.regenerateSession)) {
                                                    _context.next = 10;
                                                    break;
                                                }

                                                _context.next = 3;
                                                return ctx.regenerateSession();

                                            case 3:
                                                ctx.session.client = _lodash2.default.cloneDeep(ctx.state.oauth.token.client);
                                                user = _lodash2.default.clone(ctx.state.oauth.token.user);

                                                delete user.password;
                                                delete user.salt;
                                                delete user.emailVerified;
                                                delete user.mobileVerified;
                                                ctx.session.user = user;

                                            case 10:
                                                _context.next = 12;
                                                return next();

                                            case 12:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, _this);
                            })));

                        case 2:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();

    this.loginRequired = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(ctx, next) {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(ctx.session.user && ctx.session.client)) {
                                _context3.next = 5;
                                break;
                            }

                            _context3.next = 3;
                            return next();

                        case 3:
                            _context3.next = 6;
                            break;

                        case 5:
                            if (ctx.cookie.username) {
                                // TODO Remember me: find user and client, put which into session.
                            } else if (ctx.request.header.authorization) {
                                // TODO Authorization: Bearer find user and client.
                            } else {
                                ctx.res.statusCode = 403;
                            }

                        case 6:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this);
        }));

        return function (_x3, _x4) {
            return _ref3.apply(this, arguments);
        };
    }();

    this.logout = function () {
        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(ctx, next) {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _this.oauthServer.revokeToken(ctx.session.auth);
                            ctx.session = null;
                            _context4.next = 4;
                            return next();

                        case 4:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this);
        }));

        return function (_x5, _x6) {
            return _ref4.apply(this, arguments);
        };
    }();

    this.oauthServer = oauthServer;
};

exports.default = KoaAuth;
;