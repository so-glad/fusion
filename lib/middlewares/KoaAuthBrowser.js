
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

var filterUser = function filterUser(oriUser) {
    var user = _lodash2.default.clone(oriUser);
    delete user.password;
    delete user.salt;
    delete user.emailVerified;
    delete user.mobileVerified;
    return user;
};

var filterClient = function filterClient(oriClient) {
    return _lodash2.default.cloneDeep(oriClient);
};

var KoaAuth = function KoaAuth(oauthServer) {
    var _this = this;

    _classCallCheck(this, KoaAuth);

    this.oauthClient = null;
    this.oauthServer = null;

    this.login = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return _this.oauthServer.token(ctx, _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                if (ctx.state.oauth) {
                                                    _context.next = 4;
                                                    break;
                                                }

                                                _context.next = 3;
                                                return next();

                                            case 3:
                                                return _context.abrupt('return');

                                            case 4:
                                                if (!ctx.regenerateSession) {
                                                    _context.next = 7;
                                                    break;
                                                }

                                                _context.next = 7;
                                                return ctx.regenerateSession();

                                            case 7:
                                                ctx.session.client = filterClient(ctx.state.oauth.token.client);
                                                ctx.session.user = filterUser(ctx.state.oauth.token.user);
                                                _context.next = 11;
                                                return next();

                                            case 11:
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

    this.authed = function () {
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
                            _context3.next = 7;
                            break;

                        case 5:
                            _context3.next = 7;
                            return _this.oauthServer.authenticate(ctx, next);

                        case 7:
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
                            _this.oauthServer.revoke(ctx.session.auth);
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

    this.roleRequired = function (role, next) {
        return function () {
            var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(ctx, next) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, _this);
            }));

            return function (_x7, _x8) {
                return _ref5.apply(this, arguments);
            };
        }();
    };

    this.redirectAuthorizeUrl = function () {
        var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(ctx, next) {
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _this.oauthClient.redirect();

                        case 1:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, _this);
        }));

        return function (_x9, _x10) {
            return _ref6.apply(this, arguments);
        };
    }();

    this.callbackAuthorizeCode = function () {
        var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(ctx, next) {
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, _this);
        }));

        return function (_x11, _x12) {
            return _ref7.apply(this, arguments);
        };
    }();

    this.oauthServer = oauthServer;
}
//OAuth Server actions group


//OAuth client actions group
;

exports.default = KoaAuth;
;

/** In authed method the remember me logic */
// const remember = ctx.cookies.get('remember', {signed: true});
// if(remember) {
//     const remembers = remember.split(';');
//     const user = await userService.findUserByUsername(remembers[0]);
//     const client = await oauthService.findClientById(remembers[1]);
//     if(ctx.regenerateSession) {
//         ctx.regenerateSession();
//     }
//     ctx.session.user = filterUser(user);
//     ctx.session.client = filterClient(client);
// }