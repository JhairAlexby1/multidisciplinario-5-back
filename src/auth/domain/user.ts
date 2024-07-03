import mongoose from "mongoose";
export class User {
    constructor(
        readonly _id: mongoose.Types.ObjectId,
        readonly name: string,
        readonly email: string,
        readonly password: string
    ) {}

}