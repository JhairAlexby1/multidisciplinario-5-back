import express from "express";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {server} from './socket.io';
import {io} from './socket.io';
import '../database/db.config';
dotenv.config();

import {app} from './socket.io';
const port = process.env.PORT || 3000;
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import {DeviceSensorConsumer} from '../sensor/infraestructure/deviceSensorConsumer';
import {userRouter} from "../auth/infraestructure/userRouter";
import {sensorRouter} from "../sensor/infraestructure/sensorRouter";

app.use('/usuarios', userRouter)
app.use('/sensores', sensorRouter)

import WebSocketService from "../sensor/infraestructure/helpers/WebsocketService";
import {verifyTokenWs} from "../middlewares/auth.middleware";

io.use(verifyTokenWs);

const deviceSensorConsumer = new DeviceSensorConsumer();
console.log('Starting device sensor consumer');
deviceSensorConsumer.start(io);

io.on('connection', (socket: any) => {
    console.log('a user connected');
    const deviceSensorConsumer = new DeviceSensorConsumer();
    console.log('Starting device sensor consumer');

    WebSocketService(io, socket.setMaxListeners(20));
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


server.listen(port, () => {
    console.log(`El servidor está escuchando en el puerto ${port}`);
});