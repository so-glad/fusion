
'use strict';

/**
 * @author palmtale
 * @since 2017/5/7.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _koaLog = require('koa-log4');

var _koaLog2 = _interopRequireDefault(_koaLog);

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _oauth = require('oauth');

var _oauth2 = _interopRequireDefault(_oauth);

var _Role = require('./models/Role');

var _Role2 = _interopRequireDefault(_Role);

var _User = require('./models/User');

var _User2 = _interopRequireDefault(_User);

var _OAuthClient = require('./models/OAuthClient');

var _OAuthClient2 = _interopRequireDefault(_OAuthClient);

var _OAuthCode = require('./models/OAuthCode');

var _OAuthCode2 = _interopRequireDefault(_OAuthCode);

var _OAuthAccessToken = require('./models/OAuthAccessToken');

var _OAuthAccessToken2 = _interopRequireDefault(_OAuthAccessToken);

var _OAuthRefreshToken = require('./models/OAuthRefreshToken');

var _OAuthRefreshToken2 = _interopRequireDefault(_OAuthRefreshToken);

var _OAuthProvider = require('./models/OAuthProvider');

var _OAuthProvider2 = _interopRequireDefault(_OAuthProvider);

var _OAuthServer = require('./services/OAuthServer');

var _OAuthServer2 = _interopRequireDefault(_OAuthServer);

var _KoaOAuthServer = require('./middlewares/KoaOAuthServer');

var _KoaOAuthServer2 = _interopRequireDefault(_KoaOAuthServer);

var _KoaAuthBrowser = require('./middlewares/KoaAuthBrowser');

var _KoaAuthBrowser2 = _interopRequireDefault(_KoaAuthBrowser);

var _Context2 = require('./Context');

var _Context3 = _interopRequireDefault(_Context2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var configDatabase = function configDatabase(databases) {
    var dbLogger = _koaLog2.default.getLogger('fusion-db');
    var common = new _sequelize2.default(databases.common.name, databases.common.username, databases.common.password, {
        dialect: databases.common.dialect,
        host: databases.common.host,
        port: databases.common.port,
        pool: {
            max: 8,
            min: 3,
            idle: 10000
        },
        logging: function logging(msg) {
            return dbLogger.info.apply(dbLogger, [msg]);
        }
    });
    return { common: common };
};

var configModels = function configModels(databases) {
    var defaultOptions = { logger: _koaLog2.default.getLogger('fusion-db') };

    var Role = new _Role2.default(databases.common, defaultOptions);

    _User2.default.addBelongTo(Role.delegate, 'role', 'role_id');
    var User = new _User2.default(databases.common, defaultOptions);

    _OAuthClient2.default.addBelongTo(User.delegate, 'user', 'user_id');
    var OAuthClient = new _OAuthClient2.default(databases.common, defaultOptions);

    _OAuthCode2.default.addBelongTo(User.delegate, 'user', 'user_id');
    _OAuthCode2.default.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
    var OAuthCode = new _OAuthCode2.default(databases.common, defaultOptions);

    _OAuthAccessToken2.default.addBelongTo(User.delegate, 'user', 'user_id');
    _OAuthAccessToken2.default.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
    var OAuthAccessToken = new _OAuthAccessToken2.default(databases.common, defaultOptions);
    _OAuthRefreshToken2.default.addBelongTo(OAuthAccessToken.delegate, 'accessToken', 'access_token_id');
    var OAuthRefreshToken = new _OAuthRefreshToken2.default(databases.common, defaultOptions);

    var OAuthProvider = new _OAuthProvider2.default(databases.common, defaultOptions);
    return {
        Role: Role,
        User: User,
        OAuthClient: OAuthClient,
        OAuthCode: OAuthCode,
        OAuthAccessToken: OAuthAccessToken,
        OAuthRefreshToken: OAuthRefreshToken,
        OAuthProvider: OAuthProvider
    };
};

var Container = function (_Context) {
    _inherits(Container, _Context);

    function Container(config) {
        _classCallCheck(this, Container);

        var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this, config));

        _koaLog2.default.configure(_this.config.log4js, { cwd: _this.config.log4js.cwd });
        var databases = configDatabase(_this.config.databases);
        var models = configModels(databases);
        var oauthServer = new _KoaOAuthServer2.default({
            debug: false,
            model: new _OAuthServer2.default(models)
        });

        _this.register('models', models).register('auth', new _KoaAuthBrowser2.default(oauthServer)).register('default.client', _this.config.client).register('client.oauth', _oauth2.default);
        return _this;
    }

    return Container;
}(_Context3.default);

exports.default = Container;


module.exports = Container;