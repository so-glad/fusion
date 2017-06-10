'use strict';

/**
 * @author palmtale
 * @since 2017/5/22.
 */


import log4js from 'log4js';

const grantTypes = (value) => {
    const grants = [];
    if ((1 & value) === 1) {
        grants.push('authorization_code');
    }
    if ((2 & value) === 2) {
        grants.push('password');
    }
    if ((4 & value) === 4) {
        grants.push('client_credentials');
    }
    if ((8 & value) === 8) {
        grants.push('proxy');
    }
    if ((16 & value) === 16) {
        grants.push('refresh_token');
    }
    return grants;
};

export default class OAuthClientService {

    clientModel = null;

    logger = console;

    constructor(options) {
        this.clientModel = options.OAuthClientModel;
        this.logger = (typeof options.logger === 'string') ? log4js.getLogger(options.logger) :
            (options.logger || this.logger);
    }

    getClient = async (clientId, clientSecret) => {
        try {
            console.info(this.clientModel);
            const oauthClient = await this.clientModel.findOne({
                where: {
                    id: clientId,
                    secret: clientSecret
                }
            });
            console.info(oauthClient);
            if (oauthClient) {
                return {
                    id: oauthClient.id,
                    clientId: oauthClient.id,
                    clientSecret: oauthClient.secret,
                    grants: grantTypes(oauthClient.grantTypes)
                };
            }
            this.logger.warn('Get client via id[' + clientId + '], secret[' + clientSecret + '] error.');
            return false;
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };

    getClientById = async (clientId) => {
        try {
            const client = await this.clientModel.findByPrimary(clientId);
            if(!client) {
                return null;
            }
            return {
                id: client.id,
                clientId: client.id,
                clientSecret: client.secret,
                grants: grantTypes(client.grantTypes)
            };
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };
}