import { JsonController, Post, Body, Get, Render } from "routing-controllers";
import OrdersService from "../../libs/orders.service.js";

@JsonController('', { transformResponse: true })
class OrdersController {

    orderService = new OrdersService();

    @Post('/')
    insertOrder(@Body() order: any) {

        this.orderService.insertOrder(order);

        return {
            status: 200,
            success: true
        };
    }


}

export default OrdersController;