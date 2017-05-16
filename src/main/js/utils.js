'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

import _ from 'lodash';

Date.prototype.format = function (pattern) {// For use 'this', arrow function is not OK.
    let result = pattern;
    const o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        'S': this.getMilliseconds()
    };
    if (/(y+)/.test(result)){
        result = result.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o)
        if (new RegExp('(' + k + ')').test(result)){
            result = result.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    return result;
};

module.exports = {
    promisefy: (instance, method) => {
        let methodImpl = method;
        if (_.isString(method)) {
            methodImpl = instance[method];
        }

        return function () { // For find arguments, arrow function is not OK.
            const args = Array.prototype.slice.call(arguments);
            return new Promise((resolve, reject) => {
                args.push((err, ...result) => {
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
};

export default module.exports;