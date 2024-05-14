
# payouts-beta
This app simply demos Payouts Beta to facilitate a claims insurance payout direct to bank accounts

To enable payouts there is special beta sdk and gh key to use as per  https://docs.corp.stripe.com/sdks-v2?lang=node 

Use Gh token STRIPE_V2_SDK_GH_TOKEN in env ghp_u5QgAp******POe
```bash
# Add a reference to the private feed to ~/.npmrc. Replace GITHUB_TOKEN with the token you just created.

# ~/.npmrc
%rp(9):payouts-beta$ nano  ~/.npmrc
//npm.pkg.github.com/:_authToken=ghp_u5Qg***POe
@stripe:registry=https://npm.pkg.github.com


# Install @stripe/stripe package by running npm install or adding an entry to the package.json.
# package.json
# see https://github.com/stripe/stripe-node-next/releases/tag/v0.48.0
 "dependencies": {
    "body-parser": "^1.20.1",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    // "stripe": "^14.21.0",        < -- REMOVE
    "@stripe/stripe": "0.48.0"   < -- ADDED
  }

# in code server.js
const stripe = require('@stripe/stripe')(process.env.STRIPE_V2_API_KEY, {
//   apiVersion: '2024-04-11'
});

%npm install
%npm start

http://localhost:4242/account
http://localhost:4242/financialaddresses




```

There is a file called .env.example which you will need to 
1. rename to .env 
2. Add your own values for Stripe API Keys etc. Add a customer ID for a customer you have already created
3. Copy the .env file into the /server folder
4. In the terminal navigate to the /server folder and run 'npm install'
5. Run 'npm start'
6. You should be able to navigate to your app locally (default is http://localhost:4242 ) and you should see a Direct Debit form
   
7. Fill out the form and click the disclaimer. You can use these test bank account details:
    - Sort Code: 10-88-00
    - Bank Account: 00012345
  
8. Once you have submitted the form you should see a valid direct debit payment method attached to your customer.
