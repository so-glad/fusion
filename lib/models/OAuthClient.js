
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _ModelClass2 = require('./ModelClass');

var _ModelClass3 = _interopRequireDefault(_ModelClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OAuthClient = function (_ModelClass) {
    _inherits(OAuthClient, _ModelClass);

    _createClass(OAuthClient, [{
        key: 'name',
        get: function get() {
            return 'oauth_client';
        }
    }, {
        key: 'belongsToDefine',
        get: function get() {
            return OAuthClient.belongsToDefines;
        }
    }, {
        key: 'defaultOptions',
        get: function get() {
            return {
                schema: 'public',

                tableName: 'oauth_client',

                timestamps: true,

                paranoid: false,

                underscored: true
            };
        }
    }, {
        key: 'fieldsDefine',
        get: function get() {
            return {
                id: {
                    type: _sequelize2.default.BIGINT.UNSIGNED,
                    primaryKey: true,
                    autoIncrement: false,
                    defaultValue: _sequelize2.default.DEFAULT,
                    field: 'id'
                },
                secret: {
                    type: _sequelize2.default.STRING,
                    field: 'secret',
                    unique: true
                },
                name: {
                    type: _sequelize2.default.STRING,
                    field: 'name',
                    unique: true
                },
                redirect: {
                    type: _sequelize2.default.STRING,
                    field: 'redirect',
                    unique: true
                },
                grantTypes: {
                    type: _sequelize2.default.INTEGER,
                    field: 'grant_types',
                    defaultValue: 1
                },
                revoked: {
                    type: _sequelize2.default.BOOLEAN,
                    field: 'revoked',
                    default: false
                }
            };
        }
    }]);

    function OAuthClient(provider, options) {
        _classCallCheck(this, OAuthClient);

        return _possibleConstructorReturn(this, (OAuthClient.__proto__ || Object.getPrototypeOf(OAuthClient)).call(this, provider, options));
    }

    return OAuthClient;
}(_ModelClass3.default);

OAuthClient.belongsToDefines = [];

OAuthClient.addBelongTo = function (type, as, foreignKey) {
    OAuthClient.belongsToDefines.push({ type: type, as: as, foreignKey: foreignKey });
};

exports.default = OAuthClient;
;