import mongoose from "mongoose";

export class Sensor {
    constructor(
        readonly _id: mongoose.Types.ObjectId,
        readonly lumen: number,
        readonly temperature: number,
        readonly humidity: number,
        readonly fecha: Date
    ) {}

}