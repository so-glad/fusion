
'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    promisefy: function promisefy(instance, method) {
        var methodImpl = method;
        if (_lodash2.default.isString(method)) {
            methodImpl = instance[method];
        }

        return function () {
            // For find arguments, arrow function is not OK.
            var args = Array.prototype.slice.call(arguments);
            return new Promise(function (resolve, reject) {
                args.push(function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
                methodImpl.apply(instance, args);
            });
        };
    }
};exports.default = module.exports;