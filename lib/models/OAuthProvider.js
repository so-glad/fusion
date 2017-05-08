
'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
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

var OAuthProvider = function (_ModelClass) {
    _inherits(OAuthProvider, _ModelClass);

    _createClass(OAuthProvider, [{
        key: 'name',
        get: function get() {
            return 'oauth_provider';
        }
    }, {
        key: 'defaultOptions',
        get: function get() {
            return {
                schema: 'public',

                tableName: 'oauth_provider',

                timestamps: true,

                paranoid: false,

                underscored: true
            };
        }
    }, {
        key: 'fieldsDefine',
        get: function get() {
            return {
                type: {
                    type: _sequelize2.default.STRING,
                    field: 'type',
                    unique: 'oauth_provider_type_client_id_unique'
                },
                clientId: {
                    type: _sequelize2.default.STRING,
                    field: 'client_id',
                    unique: 'oauth_provider_type_client_id_unique'
                },
                clientSecret: {
                    type: _sequelize2.default.STRING,
                    field: 'client_secret'
                },
                revoked: {
                    type: _sequelize2.default.BOOLEAN,
                    field: 'revoked',
                    defaultValue: false
                },
                name: {
                    type: _sequelize2.default.STRING,
                    field: 'name'
                },
                redirectUrl: {
                    type: _sequelize2.default.STRING,
                    field: 'redirect_url'
                },
                authorizeUrl: {
                    type: _sequelize2.default.STRING,
                    field: 'authorize_url'
                },
                tokenUrl: {
                    type: _sequelize2.default.STRING,
                    field: 'token_url'
                }
            };
        }
    }]);

    function OAuthProvider(provider, options) {
        _classCallCheck(this, OAuthProvider);

        return _possibleConstructorReturn(this, (OAuthProvider.__proto__ || Object.getPrototypeOf(OAuthProvider)).call(this, provider, options));
    }

    return OAuthProvider;
}(_ModelClass3.default);

exports.default = OAuthProvider;