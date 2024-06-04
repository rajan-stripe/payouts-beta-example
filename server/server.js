const express = require('express');
const app = express();

var bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({ extended: true }))

const { resolve } = require('path');

// Replace if using a different env file or config
const env = require('dotenv').config({ path: './.env' });

// app.use(express.static(process.env.STATIC_DIR));

const path = require('path');
consoleLog(path)
consoleLog(__dirname)

app.use(express.static(path.join(__dirname, process.env.STATIC_DIR)));


const stripe = require('@stripe/stripe')(process.env.STRIPE_V2_API_KEY, {
  // apiVersion: '2024-04-11',
});

const dateformat = require('date-fns/format');

function consoleLog(message) {

  // ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
  const currentDateTime = new Date().toISOString();
  console.log(`[${currentDateTime}] ${message}`);
}


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
  consoleLog(path)
  // const path = __dirname + '/index.html';
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



// Show the claim pay screen
app.get('/claimapproved', function (req, res) {

  console.log("/claimapproved")
  const path = resolve(process.env.STATIC_DIR + '/claimspay.html');
  consoleLog(path)
  res.sendFile(path)
})

app.get('/submitclaim', function (req, res) {
  console.log("/submitclaim")
  console.log(req.body)
  res.redirect('/claimapproved')
})

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
  const { claimEMailAddress } = firstItem;
  const { claimType } = firstItem;
  const { claimAddress } = firstItem;
  const { claimDetails } = firstItem;
  const { claimPolicyId } = firstItem;
  const { claimAmount } = firstItem;
  const { isBusinessClaim } = firstItem;
  const { claimFirstName } = firstItem;
  const { claimSurname } = firstItem;
   
  

  // TODO : Create a recipient with the data and when successful redirect to the payment page to take bank account details
  // https://docs.corp.stripe.com/api/v2/accounts/create 

  // const rp_account = await stripe.v2.accounts.create({
  //   include: ['legal_entity_data', 'configuration.recipient_data'],
  //   name: claimName,
  //   email: claimEMailAddress,
  //   legal_entity_data: {
  //     business_type: 'individual',
  //     country: 'us',
  //     name: claimName,
  //     representative: {
  //       address: {
  //         city : 'San Francisco',
  //         country: 'US',
  //         line1: '5 Main Street',
  //         line2: 'Union Square',
  //         postal_code: '95210',
  //       },
  //       given_name: claimFirstName,
  //       surname: claimSurname,
  //     },
  //   },
  //   configuration: {
  //     recipient_data: {
  //       features: {
  //         bank_accounts: {
  //           local: {
  //             requested: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  // console.log(rp_account);




  // // // For demonstration, let's log the price to the console
  // // console.log(`Name: ${rp_name}`);

  // // res.redirect('/claimapproved');

  // res.json({ rp_accountId: rp_account.id });


  // TEST
  res.json({ rp_accountId: "acct_test_61QUwGV8JP0qJFctE66QUwGVAoSQLEwzskEAKuAfAWFU" });

});


// Show the claim pay screen
app.get('/claimapproved', function (req, res) {

  console.log("/claimapproved")
  const path = resolve(process.env.STATIC_DIR + '/claimspay.html');
  consoleLog(path)
  res.sendFile(path)
})


app.get('/submitclaim', function (req, res) {
  console.log("/submitclaim")
  console.log(req.body)
  res.redirect('/claimapproved')
})

  
// Get Hosted Bank Details see https://docs.corp.stripe.com/api/v2/accounts/account-links/create 
app.post('/bankdetails-hosted', async (req, res) => {
  
  // see https://docs.corp.stripe.com/api/v2/accounts/account-links/create
  // For demonstration, let's log the received items to console
  consoleLog('/bankdetails-hosted');
  consoleLog(req.body.items);

  try {

     // Ensure there are items in the request body
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: "No items provided." });
    }

    // Extract the first item from the array
    const firstItem = req.body.items[0];

    // // Extract the price of the first item
    const { rp_accountId } = firstItem; 
    consoleLog(`Create hosted checkout for: ${rp_accountId}`);

    // Need to rediect back to the claimspay but as we are doing local host goto another page for local testing redirect as need a actual page
    const accountLink = await stripe.v2.accountLinks.create({
      account: rp_accountId,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['recipient'],
          // refresh_url: 'http://localhost://4242/claimpay-send.html',
          // return_url: 'http://localhost://4242/claimpay-send.html',
          refresh_url: 'https://stripe-localhost-redirectpage.glitch.me?http://localhost:4242/claimspay.html',
          return_url: 'https://stripe-localhost-redirectpage.glitch.me?http://localhost:4242/claimspay-send.html?return_from_hosted',
        },
      },
    });

    consoleLog(accountLink);
    const hostedUrl = accountLink.url;

    // Respond with the redirect URL
    res.json({ redirectUrl: hostedUrl });

  } 
  catch (error) {
    console.error('Error while initializing hosted bank details collection:', error);
    res.status(500).json({ error: 'Failed to initialize hosted bank details collection' + error });
  }
   
});


// Test Approve claim - create recipient and then take to bank account self hosting
app.post('/approve-claim', async (req, res) => {
  
  // For demonstration, let's log the received items to console
  consoleLog('/approve-claim');
  consoleLog(req.body.items);
  
   // Ensure there are items in the request body
  if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: "No items provided." });
  }

  // Extract the first item from the array
  const firstItem = req.body.items[0];

  // // Extract the price of the first item
  const { claimName } = firstItem;
  const { claimEMailAddress } = firstItem;
  const { claimType } = firstItem;
  const { claimAddress } = firstItem;
  const { claimDetails } = firstItem;
  const { claimPolicyId } = firstItem;
  const { claimAmount } = firstItem;
  const { isBusinessClaim } = firstItem;
  const { claimFirstName } = firstItem;
  const { claimSurname } = firstItem;
   
  

  // TODO : Create a recipient with the data and when successful redirect to the payment page to take bank account details
  // https://docs.corp.stripe.com/api/v2/accounts/create 


  const rp_account = await stripe.v2.accounts.retrieve(
    'acct_test_61QSiioAgmgqkXZPt66QSiioAoSQZDmtXkAMwGDU87Iu',
    {
      include: ['legal_entity_data', 'configuration.recipient_data'],
    }
  );

  consoleLog(`accounts.retrieve: ${JSON.stringify(rp_account, null, 2)}`);
  res.json(rp_account);
   
});



// // Approve claim - create recipient and then take to bank account self hosting
// app.post('/approve-claim', async (req, res) => {
  
//   // For demonstration, let's log the received items to console
//   consoleLog(req.body.items);
  
//    // Ensure there are items in the request body
//   if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
//       return res.status(400).json({ error: "No items provided." });
//   }

//   // Extract the first item from the array
//   const firstItem = req.body.items[0];

//   // // Extract the price of the first item
//   const { claimName } = firstItem;
//   const { claimEMailAddress } = firstItem;
//   const { claimType } = firstItem;
//   const { claimAddress } = firstItem;
//   const { claimDetails } = firstItem;
//   const { claimPolicyId } = firstItem;
//   const { claimAmount } = firstItem;
//   const { isBusinessClaim } = firstItem;
//   const { claimFirstName } = firstItem;
//   const { claimSurname } = firstItem;
   
  

//   // TODO : Create a recipient with the data and when successful redirect to the payment page to take bank account details
//   // https://docs.corp.stripe.com/api/v2/accounts/create 

//   const rp_account = await stripe.v2.accounts.create({
//     include: ['legal_entity_data', 'configuration.recipient_data'],
//     name: claimName,
//     email: claimEMailAddress,
//     legal_entity_data: {
//       business_type: 'individual',
//       country: 'us',
//       name: claimName,
//       representative: {
//         address: {
//           city : 'San Francisco',
//           country: 'US',
//           line1: '5 Main Street',
//           line2: 'Union Square',
//           postal_code: '95210',
//         },
//         given_name: claimFirstName,
//         surname: claimSurname,
//       },
//     },
//     configuration: {
//       recipient_data: {
//         features: {
//           bank_accounts: {
//             local: {
//               requested: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   consoleLog(rp_account);


  

//   // // For demonstration, let's log the price to the console
//   // console.log(`Name: ${rp_name}`);

//   // res.redirect('/claimapproved');

//   res.json({ rp_accountId: rp_account.id });
// });




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
