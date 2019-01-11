import { UserInterface } from 'spinal-models-user/declarations/SpinalUser';
export declare class ServiceUser {
    contextId: string;
    private context;
    private users;
    private createContext;
    init(): void;
    createUser(user: UserInterface): Promise<boolean>;
    getUser(email: any, password: any): Promise<UserInterface>;
    private findUser;
}
