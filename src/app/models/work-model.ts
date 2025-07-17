import { AudioModel } from "./audio-model"
import { UserModel } from "./user-model"

export interface WorkModel {
    workId: number,
    title: string,
    bpm: number,
    key: string,
    audio: AudioModel,
    img: string,
    user: {
        userId: number;
        userName: string;
        artName: string;
        email: string;
    },
    dataDiCreazione: string;
    nota: string|null,
}
