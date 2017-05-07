'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModelClass = function () {
    _createClass(ModelClass, [{
        key: 'name',
        get: function get() {
            return null;
        }
    }, {
        key: 'fieldsDefine',
        get: function get() {
            return {};
        }
    }, {
        key: 'belongsToDefine',
        get: function get() {
            return [];
        }
    }, {
        key: 'defaultOptions',
        get: function get() {
            return {};
        }
    }]);

    function ModelClass(provider, options) {
        var _this = this;

        _classCallCheck(this, ModelClass);

        this.logger = console;
        this.provider = null;
        this.delegate = null;

        options = _lodash2.default.cloneDeep(options);
        this.provider = provider;

        for (var option in this.defaultOptions) {
            if (!options[option]) {
                options[option] = this.defaultOptions[option];
            }
        }

        this.logger = options.logger ? options.logger : this.logger;
        delete options.logger;

        this.delegate = this.provider.define(this.name, this.fieldsDefine, options);

        if (this.belongsToDefine.length > 0) {
            for (var index in this.belongsToDefine) {
                var belongTo = this.belongsToDefine[index];
                this.delegate.belongsTo(belongTo.type, { as: belongTo.as, foreignKey: belongTo.foreignKey });
            }
        }

        this.delegate.sync({ force: false }).then(function () {
            _this.logger.trace("Connected table " + options.tableName);
        }).catch(function (e) {
            _this.logger.error("Error while connecting table " + options.tableName + ", cause: " + e.message);
        });

        var _loop = function _loop(fn) {
            if (_this.delegate[fn] instanceof Function) {
                _this[fn] = function () {
                    var _delegate;

                    return (_delegate = _this.delegate)[fn].apply(_delegate, arguments);
                };
            }
        };

        for (var fn in this.delegate) {
            _loop(fn);
        }
    }

    return ModelClass;
}();

exports.default = ModelClass;