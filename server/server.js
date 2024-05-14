const express = require('express');
const app = express();
const { resolve } = require('path');
// Replace if using a different env file or config
const env = require('dotenv').config({ path: './.env' });


const stripe = require('@stripe/stripe')(process.env.STRIPE_V2_API_KEY, {
  // apiVersion: '2024-04-11',
});

const dateformat = require('date-fns/format');

function consoleLog(message) {

  // ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
  const currentDateTime = new Date().toISOString();
  console.log(`[${currentDateTime}] ${message}`);
}

app.use(express.static(process.env.STATIC_DIR));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get('/', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});

app.get('/accountname', (req, res) => {
  res.send({
    accountName: process.env.STRIPE_ACCOUNT_NAME,
  });
});


// Test Stripe endpoint sdk
app.get('/account', async (req, res) => {
  try {
    const account =  await stripe.accounts.retrieve(); // Using the default account associated with the secret key
   
    consoleLog(`Account: ${JSON.stringify(account, null, 2)}`);
    consoleLog(`Account Id: ${account.id}`);
    consoleLog(`Account Name: ${account.settings.dashboard.display_name}`);
   
     // Sending the entire account object as a JSON response
     res.json(account);
  } 
  catch (error) {
    console.error("Error getting /account information:", error);
    res.status(500).send("Failed to get /account");
  }
});


// Test https://docs.corp.stripe.com/api/v2/financial-addresses?lang=nodek
app.get('/financialaddress', async (req, res) => {
  try {
    const financialAddresses = await stripe.v2.financialAddresses.list();
    
    consoleLog(`FinancialAddresses: ${JSON.stringify(financialAddresses, null, 2)}`);
    consoleLog(`id: ${financialAddresses.data[0].id}`);
    consoleLog(`financial_account: ${financialAddresses.data[0].financial_account}`);

    
     // Sending the entire account object as a JSON response
     res.json(financialAddresses);
  } 
  catch (error) {
    console.error("Error getting /financialaddress:", error);
    res.status(500).send("Failed to get /financialaddress");
  }
});

app.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.get('/accountid', (req, res) => {
  res.send({
    accountId: process.env.STRIPE_ACCOUNT_ID,
  });
});

// app.get('/secret', async (req, res) => {
//   const intent = await stripe.setupIntents.create({
//     customer: process.env.CUSTOMER_ID,
//     // payment_method_types: ['bacs_debit'],
//     payment_method_types: ['card'],
//   });
//   res.json({ client_secret: intent.client_secret });
// });

// Approve claim - create recipient and then take to bank account self hosting
app.post('/approve-claim', async (req, res) => {
  
  // For demonstration, let's log the received items to console
  console.log(req.body.items);
  
   // Ensure there are items in the request body
  if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: "No items provided." });
  }

  // Extract the first item from the array
  const firstItem = req.body.items[0];

  // // Extract the price of the first item
  const { claimName } = firstItem;
  const { claimType } = firstItem;
  const { claimAddress } = firstItem;
  const { claimDetails } = firstItem;
  const { claimPolicyId } = firstItem;
  const { claimAmount } = firstItem;
  

  // TODO : Create a recipient with the data and when successful redirect to the payment page to take bank account details


  // // For demonstration, let's log the price to the console
  // console.log(`Name: ${rp_name}`);
  console.log("/claimspay.html");
  res.redirect(307, "claimspay.html")

});




// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
app.post('/webhook', async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'payment_intent.succeeded') {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log('💰 Payment captured!');
  } else if (eventType === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed.');
  }
  res.sendStatus(200);
});

app.listen(4242, () =>
  console.log(`Node server listening at http://localhost:4242`)
);
