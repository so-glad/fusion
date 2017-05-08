
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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var changePathVars = function changePathVars(config, confPath) {
    for (var key in config) {
        if (_lodash2.default.isString(config[key])) {
            config[key] = config[key].replace('${path.root}', confPath.root).replace('${path.client}', confPath.client).replace('${path.server}', confPath.server).replace('${path.resources}', confPath.resources);
        } else if (_lodash2.default.isObject(config[key])) {
            config[key] = changePathVars(config[key], confPath);
        }
    }
    return config;
};

var refactorPath = function refactorPath(config) {
    if (!config.path.root && !config.path.server) {
        config.path.server = __dirname;
        config.path.root = _path2.default.join(__dirname, '..');
    } else if (!config.path.root) {
        var relation = '..',
            serverPath = config.path.server;
        while (serverPath.indexOf('/') > 0) {
            serverPath = serverPath.substring(serverPath.indexOf('/') + 1);
            relation += '/..';
        }
        config.path.root = _path2.default.join(__dirname, relation);
    }
    //Change path to absolute path.
    if (process.platform === 'windows') {
        if (config.path.client.indexOf(':\\') !== 1) {
            config.path.client = _path2.default.join(config.path.root, config.path.client);
        }
        if (config.path.server.indexOf(':\\') !== 1) {
            config.path.server = _path2.default.join(config.path.root, config.path.server);
        }
        if (config.path.resources.indexOf(':\\') !== 1) {
            config.path.resources = _path2.default.join(config.path.root, config.path.resources);
        }
    } else {
        if (config.path.client.indexOf('/') !== 0) {
            config.path.client = _path2.default.join(config.path.root, config.path.client);
        }
        if (config.path.server.indexOf('/') !== 0) {
            config.path.server = _path2.default.join(config.path.root, config.path.server);
        }
        if (config.path.resources.indexOf('/') !== 0) {
            config.path.resources = _path2.default.join(config.path.root, config.path.resources);
        }
    }
    return changePathVars(config, config.path);
};

var Context = function () {
    function Context(config) {
        _classCallCheck(this, Context);

        this.config = null;
        this.modules = {};

        this.config = _lodash2.default.cloneDeep(config);
        this.config = refactorPath(this.config);
    }

    _createClass(Context, [{
        key: 'module',
        value: function module(name, _module) {
            if (_module) {
                this.modules[name] = _module;
                return this;
            } else {
                return this.modules[name];
            }
        }
    }, {
        key: 'register',
        value: function register(name, module) {
            this.modules[name] = module;
            return this;
        }
    }, {
        key: 'getModule',
        value: function getModule(name) {
            return this.modules[name];
        }
    }]);

    return Context;
}();

exports.default = Context;
;