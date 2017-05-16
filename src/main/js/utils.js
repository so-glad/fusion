'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

import _ from 'lodash';

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