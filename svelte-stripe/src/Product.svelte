<script>
  let stripe = Stripe('pk_test_m3a5moXVKgThpdfwzKILvnbG');
  let api = 'http://localhost:5000/awesomeapp-dev/us-central1/payments';

  export let amount;
  export let name;
  export let sku = 'sku_G2rCWkAssjoqW8';

  // Basic Checkout

  async function startCheckout() {

    const { error } = await stripe.redirectToCheckout({
      items: [{ sku, quantity: 1 }],

      successUrl: 'https://fireship.io/success',
      cancelUrl: 'https://fireship.io/canceled',
    });

    if (error) {
        alert('our payment system is broken!')
    }
  }

  // Payment Intents

  import { onMount } from 'svelte';

  let elements = stripe.elements();
  let card; // HTML div to mount card
  let cardElement;
  let complete = false;

  let paymentIntent;
  let clientSecret;

  onMount(async () => {
    paymentIntent = await createIntent();
    clientSecret = paymentIntent.client_secret;
    console.log(paymentIntent)
    createCardForm();
  });

  // Step 1
  async function createIntent() {
    const url = api + '/intents';
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    };
    return ( await fetch(url, params) ).json();

    console.log(paymentIntent);
  }

  // Step 2
  async function createCardForm() {
    cardElement = elements.create('card');
    cardElement.mount(card);

    cardElement.on('change', (e) => complete = e.complete);
  }

  // Step 3
  async function submitPayment() {
    const result = await stripe.handleCardPayment(
      clientSecret, cardElement, {
        payment_method_data: {
        
        }
      }
    );

    paymentIntent = result.paymentIntent;

    console.log(paymentIntent)

    if (result.error) {
      console.error(error);
      alert('fudge!');
    }
  }
  
</script>

<style>
section {
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  border-radius: 5px; /* 5px rounded corners */
  width: 500px;
  padding: 2em;
  margin: 0 auto;
}
.elements {  margin: 2em 0; background: rgb(230, 230, 230); border-radius: 5px; padding: 1em; }

i { font-size: 5em; text-align: center; display: block; font-style: normal; }

button {
  background: lightgreen; border: none;
}
button:disabled {
  background: #dddddd;
  cursor: not-allowed;
}
</style>

<section>

  <h2>Stripe Checkout</h2>

  <i>⌚</i>

  <button on:click={startCheckout}> Buy me ${amount / 100} </button>

</section>

<section>

  <h2>Payment Intents with Stripe Elements</h2>

  <i>⌚</i>
  
  <div class="elements" bind:this={card}></div>

  <button on:click={submitPayment} disabled={!paymentIntent || !complete}>
    Submit Payment for ${amount / 100}
  </button>

</section>