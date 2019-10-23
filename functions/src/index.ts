import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

import * as Stripe from 'stripe';
const stripe = new Stripe('sk_test_xxxxxxxx');

import * as express from 'express';
import * as cors from 'cors';

const app = express();
app.use(cors({ origin: true }));


app.post('/intents', async (req, res) => { 
  const { amount } = req.body;

  // console.log(amount, req.body)

  const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { uid: 'test' }
  });

  res.send(paymentIntent);
});

app.post('/checkouts', async (req, res) => { 
  const { amount, name, img } = req.body;

  // console.log(amount, req.body)
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      amount,
      name,
      description: 'Trust me, you want this!',
      images: [img],
      currency: 'usd',
      quantity: 1,
    }],
    success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://example.com/cancel',
  });

  res.send(checkoutSession);
});




export const payments = functions.https.onRequest(app);



export const fulfillPurchaseWebook = functions.https.onRequest((request, response) => {
    
    const { } = request.body;

    const sig = request.headers['stripe-signature'] as string;


    const endpointSecret = 'whsec_4z15csb2jkOQh9m7R58K3bfeeGjckbBc'; // Set as env variable

    let event;
  
    try {
      event = stripe.webhooks.constructEvent(request.body.rawBody, sig, endpointSecret);
    } catch (err) {
      response.status(400).end();
      return;
    }
    
  
    const intent  = event.data.object as Stripe.paymentIntents.IPaymentIntent;

    switch (event.type) {
      case 'payment_intent.succeeded':

        // fulfill purchase

        // const user = intent.metadata.uid;

        console.log("Succeeded:", intent.id);
        break;
      case 'payment_intent.payment_failed':
        const message = intent.last_payment_error && intent.last_payment_error.message;
        console.log('Failed:', intent.id, message);
        break;
    }
  
    response.sendStatus(200);
    

});
