"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2019 SpinalCom - www.spinalcom.com
 *
 *  This file is part of SpinalCore.
 *
 *  Please read all of the following terms and conditions
 *  of the Free Software license Agreement ("Agreement")
 *  carefully.
 *
 *  This Agreement is a legally binding contract between
 *  the Licensee (as defined below) and SpinalCom that
 *  sets forth the terms and conditions that govern your
 *  use of the Program. By installing and/or using the
 *  Program, you agree to abide by all the terms and
 *  conditions stated or referenced herein.
 *
 *  If you do not agree to abide by these terms and
 *  conditions, do not demonstrate your acceptance and do
 *  not install or use the Program.
 *  You should have received a copy of the license along
 *  with this file. If not, see
 *  <http://resources.spinalcom.com/licenses.pdf>.
 */
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const Constants_1 = require("./Constants");
const Errors_1 = require("./Errors");
const gRoot = typeof window === 'undefined' ? global : window;
class ServiceUser {
    createContext() {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.addContext(Constants_1.SERVICE_NAME, Constants_1.SERVICE_TYPE, undefined)
            .then((context) => {
            this.context = context;
            this.contextId = context.info.id.get();
        })
            .catch((e) => {
            console.error(e);
            return Promise.reject(Error(Errors_1.CANNOT_CREATE_CONTEXT_INTERNAL_ERROR));
        });
    }
    init() {
        this.context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(Constants_1.SERVICE_NAME);
        if (typeof this.context !== 'undefined') {
            this.contextId = this.context.info.id.get();
        }
        else {
            this.createContext()
                .catch((e) => {
                throw new Error(e);
            });
        }
    }
    createUser(user) {
        // @ts-ignore
        return gRoot.SpinalUserManager
            .new_account({}, user.email, user.password, (res) => {
            const id = parseInt(res);
            if (id !== -1) {
                const userId = spinal_env_viewer_graph_service_1.SpinalGraphService
                    .createNode(user, undefined);
                spinal_env_viewer_graph_service_1.SpinalGraphService.modifyNode(userId, { userId: id });
                spinal_env_viewer_graph_service_1.SpinalGraphService
                    .addChildInContext(this.contextId, userId, this.contextId, Constants_1.RELATION_NAME, Constants_1.RELATION_TYPE);
                return true;
            }
            return false;
        });
    }
    getUser(email, password) {
        const url = '';
        // @ts-ignore
        return gRoot.SpinalUserManager.get_user_id(url, email, password, (response) => {
            const id = parseInt(response);
            if (id === -1) {
                return false;
            }
            return this.findUser(id);
        });
    }
    findUser(userId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChild(this.contextId, [Constants_1.RELATION_NAME])
            .then((children) => {
            if (children.length < 0) {
                return Promise.reject(Errors_1.USER_NOT_FOUND);
            }
            for (let i = 0; i < children.length; i = i + 1) {
                if (children[i].hasOwnProperty('info')
                    && children[i].info.hasOwnProperty('userId')
                    && children[i].info.userId === userId) {
                    return Promise.resolve(children[i].info);
                }
            }
            return Promise.reject(Errors_1.USER_NOT_FOUND);
        });
    }
}
exports.ServiceUser = ServiceUser;
//# sourceMappingURL=ServiceUser.js.map