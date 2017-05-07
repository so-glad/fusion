
'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _utils = require('../utils');

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _debug3.default)('redis:store');

var RedisStore = function (_EventEmitter) {
    _inherits(RedisStore, _EventEmitter);

    function RedisStore(options) {
        var _this2 = this;

        _classCallCheck(this, RedisStore);

        var _this = _possibleConstructorReturn(this, (RedisStore.__proto__ || Object.getPrototypeOf(RedisStore)).call(this));

        _this.get = function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(key) {
                var data;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return (0, _utils.promisefy)(_this.client, _this.client.get)(key);

                            case 2:
                                data = _context.sent;

                                debug('get session: %s', data || 'none');

                                if (data) {
                                    _context.next = 6;
                                    break;
                                }

                                return _context.abrupt('return', null);

                            case 6:
                                _context.prev = 6;
                                return _context.abrupt('return', JSON.parse(data.toString()));

                            case 10:
                                _context.prev = 10;
                                _context.t0 = _context['catch'](6);

                                // ignore err
                                debug('parse session error: %s', _context.t0.message);

                            case 13:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, _this2, [[6, 10]]);
            }));

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        }();

        _this.set = function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(key, session, maxAge) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (typeof maxAge === 'number') {
                                    maxAge = Math.ceil(maxAge / 1000);
                                }
                                session = JSON.stringify(session);

                                if (!maxAge) {
                                    _context2.next = 8;
                                    break;
                                }

                                debug('SETEX %s %s %s', key, maxAge, session);
                                _context2.next = 6;
                                return _this.client.setex(key, maxAge, session);

                            case 6:
                                _context2.next = 11;
                                break;

                            case 8:
                                debug('SET %s %s', key, session);
                                _context2.next = 11;
                                return _this.client.set(key, session);

                            case 11:
                                debug('SET %s complete', key);

                            case 12:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, _this2);
            }));

            return function (_x2, _x3, _x4) {
                return _ref2.apply(this, arguments);
            };
        }();

        _this.destroy = function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(key) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                debug('DEL %s', key);
                                _context3.next = 3;
                                return _this.client.del(key);

                            case 3:
                                debug('DEL %s complete', key);

                            case 4:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, _this2);
            }));

            return function (_x5) {
                return _ref3.apply(this, arguments);
            };
        }();

        _this.quit = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            debug('quitting redis client');
                            _context4.next = 3;
                            return _this.client.quit();

                        case 3:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this2);
        }));
        _this.end = _this.quit;

        options = options || {};

        var client = null;
        options.auth_pass = options.auth_pass || options.pass || null; // For backwards compatibility
        options.path = options.path || options.socket || null; // For backwards compatibility
        if (!options.client) {
            debug('Init redis new client');
            client = _redis2.default.createClient(options);
        } else {
            if (options.duplicate) {
                // Duplicate client and update with options provided
                debug('Duplicating provided client with new options (if provided)');
                var dupClient = options.client;
                delete options.client;
                delete options.duplicate;
                client = dupClient.duplicate(options); // Useful if you want to use the DB option without adjusting the client DB outside koa-redis
            } else {
                debug('Using provided client');
                client = options.client;
            }
        }

        if (options.db) {
            debug('selecting db %s', options.db);
            client.select(options.db);
            client.on('connect', function () {
                client.send_anyways = true;
                client.select(options.db);
                client.send_anyways = false;
            });
        }

        client.on('error', _this.emit.bind(_this, 'error'));
        client.on('end', _this.emit.bind(_this, 'end'));
        client.on('end', _this.emit.bind(_this, 'disconnect')); // For backwards compatibility
        client.on('connect', _this.emit.bind(_this, 'connect'));
        client.on('reconnecting', _this.emit.bind(_this, 'reconnecting'));
        client.on('ready', _this.emit.bind(_this, 'ready'));
        client.on('warning', _this.emit.bind(_this, 'warning'));
        _this.on('connect', function () {
            debug('connected to redis');
            _this.connected = client.connected;
        });
        _this.on('ready', function () {
            debug('redis ready');
        });
        _this.on('end', function () {
            debug('redis ended');
            _this.connected = client.connected;
        });
        // No good way to test error
        /* istanbul ignore next */
        _this.on('error', function () {
            debug('redis error');
            _this.connected = client.connected;
        });
        // No good way to test reconnect
        /* istanbul ignore next */
        _this.on('reconnecting', function () {
            debug('redis reconnecting');
            _this.connected = client.connected;
        });
        // No good way to test warning
        /* istanbul ignore next */
        _this.on('warning', function () {
            debug('redis warning');
            _this.connected = client.connected;
        });

        //wrap redis
        _this._redisClient = client;
        _this.client = client;
        _this.connected = client.connected;
        return _this;
    }

    return RedisStore;
}(_events.EventEmitter);

exports.default = RedisStore;
;