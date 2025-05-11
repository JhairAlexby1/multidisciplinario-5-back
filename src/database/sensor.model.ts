import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
    lumen: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    fecha: { type: Date, required: true },
});

export default mongoose.model('Sensor', sensorSchema);