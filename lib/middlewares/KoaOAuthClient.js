
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

var KoaOAuthClient = function KoaOAuthClient(options) {
    var _this = this;

    _classCallCheck(this, KoaOAuthClient);

    this.service = null;

    this.getAuthorizeUrl = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
            var type, clientId, provider;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            //TODO Get provider type from ctx;
                            type = ctx.path.type;
                            clientId = ctx.request.path.client;
                            _context.next = 4;
                            return _this.service.findProvider(type, clientId);

                        case 4:
                            provider = _context.sent;

                            delete provider.clientSecret;
                            //TODO Add random state and define required scope then saved into mem store.

                            if (next) {
                                _context.next = 10;
                                break;
                            }

                            ctx.json(provider);
                            _context.next = 13;
                            break;

                        case 10:
                            ctx.state.oauth = {
                                provider: provider
                            };
                            _context.next = 13;
                            return next();

                        case 13:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();

    this.getUserAuthorizedByCode = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
            var user;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            _context2.next = 3;
                            return _this.service.connectProviderUser(type, ctx.request.path.clientId, ctx.request.path.code);

                        case 3:
                            user = _context2.sent;

                            delete user.password;
                            delete user.salt;
                            ctx.state.oauth = {
                                token: { user: user, client: null },
                                client: null
                            };

                            _context2.next = 11;
                            break;

                        case 9:
                            _context2.prev = 9;
                            _context2.t0 = _context2['catch'](0);

                        case 11:
                            _context2.prev = 11;
                            _context2.next = 14;
                            return next();

                        case 14:
                            return _context2.finish(11);

                        case 15:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this, [[0, 9, 11, 15]]);
        }));

        return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
        };
    }();

    this.service = options.service;
};

exports.default = KoaOAuthClient;
;