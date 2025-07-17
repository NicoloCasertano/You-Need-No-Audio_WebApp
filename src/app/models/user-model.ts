import { WorkModel } from "./work-model";

export interface UserModel {
    userId: number;
    userName: string;
    password: string | null;
    email: string;
    artName: string;
    works: WorkModel[];
}