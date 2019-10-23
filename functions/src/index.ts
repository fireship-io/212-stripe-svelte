import * as functions from 'firebase-functions';

import * as Stripe from 'stripe';
const stripe = new Stripe('sk_test_OPJq1i4HPWL0bjddnWR8Oj76');

import * as express from 'express';
import * as cors from 'cors';

const app = express();
app.use(cors({ origin: true }));


app.post('/intents', async (req, res) => { 
  const { amount } = req.body;

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


app.post('/webhook', async (req, res) => {

  const sig = req.headers['stripe-signature'] as string;


  const endpointSecret = 'whsec_...';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body.rawBody, sig, endpointSecret);
  } catch (err) {
    res.status(400).end();
    return;
  }
  
  // Handle Type of webhook

  const intent:any = event.data.object;

  switch (event.type) {
    case 'payment_intent.succeeded':


      console.log("Succeeded:", intent.id);
      break;
    case 'payment_intent.payment_failed':
      const message = intent.last_payment_error && intent.last_payment_error.message;
      console.log('Failed:', intent.id, message);
      break;
  }

  res.sendStatus(200);
});




export const payments = functions.https.onRequest(app);
