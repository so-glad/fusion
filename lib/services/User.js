
'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _koaLog = require('koa-log4');

var _koaLog2 = _interopRequireDefault(_koaLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = _koaLog2.default.getLogger('fusion');

var UserService = function UserService(models) {
    var _this = this;

    _classCallCheck(this, UserService);

    this.userModel = null;

    this.findUserByUsername = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(username) {
            var User;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            User = _this.userModel;
                            _context.prev = 1;
                            _context.next = 4;
                            return User.findOne({ where: { $or: [{ username: username }, { email: username }, { mobile: username }] } });

                        case 4:
                            return _context.abrupt('return', _context.sent);

                        case 7:
                            _context.prev = 7;
                            _context.t0 = _context['catch'](1);

                            logger.error(_context.t0);
                            return _context.abrupt('return', false);

                        case 11:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[1, 7]]);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    }();

    this.userModel = models.User;
};

exports.default = UserService;