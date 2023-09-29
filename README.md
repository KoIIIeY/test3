docker compose up

открой /socketio/resourses/index.html в браузере :)

из постмана 

POST http://localhost:3000/v1/

{
"id": "4",
"start": 10,
"end": 15,
"duration": 0
}


sber-demo-socketio-1  |     TypeError: replica.addAtom is not a function
sber-demo-socketio-1  |     at Replica.addEntity (file:///usr/src/app/node_modules/@bryntum/chronograph/src/replica2/Replica.js:50:16)
sber-demo-socketio-1  |     at OrdersService.insertOrder (file:///usr/src/app/dist/libs/orders.service.js:28:22)
sber-demo-socketio-1  |     at OrdersController.insertOrder (file:///usr/src/app/dist/modules/http/orders.controller.js:20:27)
sber-demo-socketio-1  |     at ActionMetadata.callMethod (/usr/src/app/node_modules/routing-controllers/cjs/metadata/ActionMetadata.js:91:48)
sber-demo-socketio-1  |     at /usr/src/app/node_modules/routing-controllers/cjs/RoutingControllers.js:96:34
sber-demo-socketio-1  |     at processTicksAndRejections (node:internal/process/task_queues:96:5)
