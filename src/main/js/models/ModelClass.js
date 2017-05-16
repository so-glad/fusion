'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

import _ from 'lodash';


export default class ModelClass {

    logger = console;

    get name() {
        return null;
    }

    get fieldsDefine() {
        return {};
    }

    get belongsToDefine() {
        return [];
    }

    get defaultOptions() {
        return {};
    }

    provider = null;

    delegate = null;

    constructor(provider, options) {
        options = _.cloneDeep(options);
        this.provider = provider;

        for (const option in this.defaultOptions) {
            if (!options[option]) {
                options[option] = this.defaultOptions[option];
            }
        }

        this.logger = options.logger ? options.logger : provider.logger ? provider.logger : this.logger;
        delete options.logger;

        this.delegate = this.provider.define(this.name, this.fieldsDefine, options);

        if (this.belongsToDefine.length > 0) {
            for (const index in this.belongsToDefine) {
                const belongTo = this.belongsToDefine[index];
                this.delegate.belongsTo(belongTo.type, {as: belongTo.as, foreignKey: belongTo.foreignKey});
            }
        }

        this.connect(options.tableName);

        for (const fn in this.delegate) {
            if (this.delegate[fn] instanceof Function) {
                this[fn] = (...args) => {
                    return this.delegate[fn](...args);
                };
            }
        }
    }

    connect = async () => {
        return await this.delegate.sync({force: false})
            .then(r => {
                this.logger.info('Connected table ' + r.$schema + '.' + r.tableName);
                return r;
            })
            .catch(e => this.logger.error('Error while connecting table, cause: ' + e.message));
    }
}