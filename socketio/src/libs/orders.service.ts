import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js";
import Websocket from "../modules/websocket/websocket.js";
import Task from "./task.js";

class OrdersService {

    replica: Replica = Replica.new();
    tasks:any[] = [];
    lastId = 0;

    public insertOrder(order) {
        //save in your database

        console.log('replica', this.replica);

        let task = null;

        for(let search of this.tasks){
            if(search.id == order.id){
                task = search;
                break;
            }
        }

        if(!task){
            task = Task.new(order);
        } else {
            task.id = order.id;
        }

        console.log('task', task);

        this.tasks.push(task);

        this.replica.addEntity(task);

        //send the update to the browser
        this.updateSockets(task);
    }

    private updateSockets(task) {
        const io = Websocket.getInstance();
        io.of('orders').emit('orders_updated', { data: [task] });
    }
}

export default OrdersService;