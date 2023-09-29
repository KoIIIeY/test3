import 'reflect-metadata';

import path from 'path';

import {
    createExpressServer,
    RoutingControllersOptions
} from 'routing-controllers'
import { createServer } from 'http';

import Websocket from './modules/websocket/websocket.js';
import OrdersSocket from './modules/websocket/orders.socket.js';
import OrdersController from "./modules/http/orders.controller.js";

const port = process.env.APP_PORT || 3000;

const __dirname = path.resolve();
console.log(__dirname);

const routingControllerOptions: RoutingControllersOptions = {
    routePrefix: 'v1',
    controllers: [OrdersController],
    classTransformer: true,
    cors: true,
    defaultErrorHandler: true
}

const app = createExpressServer(routingControllerOptions);
const httpServer = createServer(app);
const io = Websocket.getInstance(httpServer);

io.initializeHandlers([
    { path: '/orders', handler: new OrdersSocket() }
]);

httpServer.listen(port, () => {
    console.log(`This is working in port ${port}`);
});