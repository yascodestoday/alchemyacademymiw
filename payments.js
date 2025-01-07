const express = require('express');
const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Configure PayPal
let environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);
let client = new paypal.core.PayPalHttpClient(environment);

// Create PayPal order
router.post('/create-order', auth, async (req, res) => {
    try {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: req.body.total.toString()
                }
            }]
        });

        const order = await client.execute(request);
        res.json({ id: order.result.id });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: 'Payment creation failed' });
    }
});

// Capture PayPal payment
router.post('/capture-order', auth, async (req, res) => {
    try {
        const { orderID } = req.body;
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        const capture = await client.execute(request);

        // Create order in database
        const order = new Order({
            user: req.user.id,
            paypalOrderId: orderID,
            items: req.body.items,
            total: req.body.total,
            status: 'paid',
            shippingAddress: req.body.shippingAddress
        });

        await order.save();

        // Send confirmation email
        await sendOrderConfirmation(order);

        res.json({ success: true, order: capture.result });
    } catch (error) {
        console.error('Error capturing PayPal payment:', error);
        res.status(500).json({ error: 'Payment capture failed' });
    }
});

module.exports = router; 