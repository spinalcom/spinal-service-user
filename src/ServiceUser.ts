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
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import {
  RELATION_NAME,
  RELATION_TYPE,
  SERVICE_NAME,
  SERVICE_TYPE,
} from './Constants';
import { CANNOT_CREATE_CONTEXT_INTERNAL_ERROR, USER_NOT_FOUND } from './Errors';
import { UserInterface } from 'spinal-models-user/declarations/SpinalUser';

const gRoot = typeof window === 'undefined' ? global : window;

export class ServiceUser {
  public contextId: string;
  private context: any;
  private users: Map<string, string>;

  private createContext(): Promise<any | Error> {
    return SpinalGraphService.addContext(SERVICE_NAME, SERVICE_TYPE, undefined)
      .then((context) => {
        this.context = context;
        this.contextId = context.info.id.get();
      })
      .catch((e) => {
        console.error(e);
        return Promise.reject(Error(CANNOT_CREATE_CONTEXT_INTERNAL_ERROR));
      });
  }
  public init() {
    this.context = SpinalGraphService.getContext(SERVICE_NAME);
    if (typeof this.context !== 'undefined') {
      this.contextId = this.context.info.id.get();
    } else {
      this.createContext()
        .catch((e) => {
          throw new Error(e);
        });
    }
  }
  public createUser(user: UserInterface): Promise<boolean> {
    // @ts-ignore
    return gRoot.SpinalUserManager
      .new_account(
        {},
        user.email,
        user.password,
        (res) => {
          const id = parseInt(res);
          if (id !== -1) {

            const userId = SpinalGraphService
              .createNode(user, undefined);
            SpinalGraphService.modifyNode(userId, { userId: id });
            SpinalGraphService
              .addChildInContext(
                this.contextId,
                userId,
                this.contextId,
                RELATION_NAME,
                RELATION_TYPE);
            return true;
          }
          return false;
        });
  }

  public getUser(email, password): Promise<UserInterface> {
    const url = '';
    // @ts-ignore
    return gRoot.SpinalUserManager.get_user_id(
      url,
      email,
      password,
      (response) => {
        const id = parseInt(response);
        if (id === -1) {
          return false;
        }
        return this.findUser(id);
      },
    );
  }

  private findUser(userId: number): Promise<UserInterface> {
    return SpinalGraphService.getChild(this.contextId, [RELATION_NAME])
      .then((children) => {
        if (children.length < 0) {
          return Promise.reject(USER_NOT_FOUND);
        }
        for (let i = 0; i < children.length; i = i + 1) {
          if (
            children[i].hasOwnProperty('info')
            && children[i].info.hasOwnProperty('userId')
            && children[i].info.userId === userId
          ) {
            return Promise.resolve(children[i].info);
          }
        }
        return Promise.reject(USER_NOT_FOUND);
      });
  }
}
