
'use strict';

/**
 * @author palmtale
 * @since 2017/5/2.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _oauth2Server = require('oauth2-server');

var _oauth2Server2 = _interopRequireDefault(_oauth2Server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KoaOAuthServer = function KoaOAuthServer(options) {
    var _this = this;

    _classCallCheck(this, KoaOAuthServer);

    this.server = null;
    this.service = null;

    this.authenticate = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
            var request;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            request = new _oauth2Server.Request(ctx.request);
                            _context.prev = 1;
                            _context.next = 4;
                            return _this.server.authenticate(request);

                        case 4:
                            _context.t0 = _context.sent;
                            ctx.state.oauth = {
                                token: _context.t0
                            };
                            _context.next = 11;
                            break;

                        case 8:
                            _context.prev = 8;
                            _context.t1 = _context['catch'](1);
                            return _context.abrupt('return', _this.handleError(_context.t1));

                        case 11:
                            _context.next = 13;
                            return next();

                        case 13:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[1, 8]]);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();

    this.authorize = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
            var request, response;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            request = new _oauth2Server.Request(ctx.request);
                            response = new _oauth2Server.Response(ctx.response);
                            _context2.prev = 2;
                            _context2.next = 5;
                            return _this.server.authorize(request, response);

                        case 5:
                            _context2.t0 = _context2.sent;
                            ctx.state.oauth = {
                                code: _context2.t0
                            };


                            _this.handleResponse(response);
                            _context2.next = 13;
                            break;

                        case 10:
                            _context2.prev = 10;
                            _context2.t1 = _context2['catch'](2);
                            return _context2.abrupt('return', _this.handleError(_context2.t1, response));

                        case 13:
                            _context2.next = 15;
                            return next();

                        case 15:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this, [[2, 10]]);
        }));

        return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.token = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(ctx, next) {
            var request, response, token;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            request = new _oauth2Server.Request(ctx.request);
                            response = new _oauth2Server.Response(ctx.response);
                            _context3.prev = 2;
                            _context3.next = 5;
                            return _this.server.token(request, response);

                        case 5:
                            token = _context3.sent;

                            ctx.state.oauth = {
                                token: token
                            };

                            _this.handleResponse(ctx, response);
                            _context3.next = 13;
                            break;

                        case 10:
                            _context3.prev = 10;
                            _context3.t0 = _context3['catch'](2);
                            return _context3.abrupt('return', _this.handleError(_context3.t0, response));

                        case 13:
                            _context3.next = 15;
                            return next();

                        case 15:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this, [[2, 10]]);
        }));

        return function (_x5, _x6) {
            return _ref3.apply(this, arguments);
        };
    }();

    this.revokeToken = function (token) {
        _this.service.revokeToken(token);
    };

    this.handleResponse = function (ctx, response) {
        ctx.res.statusCode = response.status;
        for (var header in response.headers) {
            ctx.res.setHeader(header, response.headers[header]);
        }
    };

    this.handleError = function (e, ctx, response) {
        if (response) {
            for (var header in response.headers) {
                ctx.res.setHeader(header, response.headers[header]);
            }
        }

        if (e instanceof _oauth2Server.UnauthorizedRequestError) {
            ctx.status = e.code;
        } else {
            ctx.body = { error: e.name, error_description: e.message };
            ctx.status = e.code;
        }
        return ctx.app.emit('error', e, _this);
    };

    //TODO Actually it is not required co.
    // for (const fn in options.model) {
    //     options.model[fn] = co.wrap(options.model[fn]);
    // }

    this.server = new _oauth2Server2.default(options);
    this.service = options.model;
}
/**
 * Authentication Middleware.
 *
 * Returns a middleware that will validate a token.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-7)
 */


/**
 * Authorization Middleware.
 *
 * Returns a middleware that will authorize a client to request tokens.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-3.1)
 */


/**
 * Grant Middleware
 *
 * Returns middleware that will grant tokens to valid requests.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-3.2)
 */
;

exports.default = KoaOAuthServer;
;