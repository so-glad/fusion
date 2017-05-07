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

var OAuthCode = function (_ModelClass) {
    _inherits(OAuthCode, _ModelClass);

    _createClass(OAuthCode, [{
        key: 'name',
        get: function get() {
            return 'oauth_code';
        }
    }, {
        key: 'belongsToDefine',
        get: function get() {
            return OAuthCode.belongsToDefines;
        }
    }, {
        key: 'defaultOptions',
        get: function get() {
            return {
                schema: 'public',

                tableName: 'oauth_code',

                timestamps: true,

                createdAt: 'timestamp',

                updatedAt: false,

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
                scopes: {
                    type: _sequelize2.default.STRING,
                    field: 'scopes',
                    default: '*'
                },
                revoked: {
                    type: _sequelize2.default.BOOLEAN,
                    field: 'revoked',
                    default: false
                },
                expiresAt: {
                    type: _sequelize2.default.DATE,
                    field: 'expires_at'
                }
            };
        }
    }]);

    function OAuthCode(provider, options) {
        _classCallCheck(this, OAuthCode);

        return _possibleConstructorReturn(this, (OAuthCode.__proto__ || Object.getPrototypeOf(OAuthCode)).call(this, provider, options));
    }

    return OAuthCode;
}(_ModelClass3.default);

OAuthCode.belongsToDefines = [];

OAuthCode.addBelongTo = function (type, as, foreignKey) {
    OAuthCode.belongsToDefines.push({ type: type, as: as, foreignKey: foreignKey });
};

exports.default = OAuthCode;
;