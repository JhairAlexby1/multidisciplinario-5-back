import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import '../database/db.config';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import '../sensor/infraestructure/deviceSensorConsumer';
import {userRouter} from "../auth/infraestructure/userRouter";
import {sensorRouter} from "../sensor/infraestructure/sensorRouter";

app.use('/usuarios', userRouter)
app.use('/sensores', sensorRouter)


app.listen(port, () => {
    console.log(`El servidor está escuchando en el puerto ${port}`);
});