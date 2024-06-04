
# payouts-beta
This app simply demos Payouts Beta to facilitate a claims insurance payout direct to bank accounts

https://github.com/rajan-stripe/payouts-beta-example 

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

# Start the server
%cd ./server
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


## Local Redirects

There are 2 options to allow redirect urls to be added to Stripe APIS use a single public webpage to redirect or NGROK. The latter creates a tunnel so might not pass your infosec. policy 

### Using Public WebPage

Use the glitch single page to redirect to your local host

Add this full url to your redirect setting in Stripe with a parameter to your localhost url page
eg: https://stripe-localhost-redirectpage.glitch.me?http://localhost:4242/claimspay-send.html

Note: ensure your server is running on localhost for the redirect to work.

```bash
const accountLink = await stripe.v2.accountLinks.create({
      account: rp_accountId,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['recipient'],
          refresh_url: 'https://stripe-localhost-redirectpage.glitch.me?http://localhost:4242/claimspay.html',
          return_url: 'https://stripe-localhost-redirectpage.glitch.me?http://localhost:4242/claimspay-send.html',
        },
      },
```


### Using ngrok


Install NGROK
https://ngrok.com/docs/getting-started/

Encountering errors that indicates that the `return_url` field must start with `https://`, which is a requirement by Stripe for security reasons. Localhost URLs that use `http://` instead of `https://` can lead to this error.

To fix this, there are a couple of options:

1. **Use HTTPS for Local Development**: Configure your local development environment to use HTTPS. You can use tools like `ngrok`, which provides a public URL that forwards to your local server, or set up HTTPS manually.

2. **Use a Public-facing Test Server**: Deploy your application to a secure, publicly accessible test server that uses HTTPS.

Here’s how you can use `ngrok` to set up a secure tunnel to your local server:

1. **Install ngrok**: If you haven't already installed `ngrok`, you can download it from [ngrok's website](https://ngrok.com/download).

2. **Start ngrok**: Open a terminal and run:
   ```sh
   ngrok http 4242
   ```
   Replace `4242` with the port number your local server is running on. This command will generate a public HTTPS URL that forwards to your local server.

3. **Update Return URL**: Use the `ngrok` URL as your `return_url` and `refresh_url`:
   ```plaintext
   const accountLink = await stripe.v2.accountLinks.create({
     account: rp_accountId,
     use_case: {
       type: 'account_onboarding',
       account_onboarding: {
         configurations: ['recipient'],
         refresh_url: 'https://<your-ngrok-url>/refresh',
         return_url: 'https://<your-ngrok-url>/return',
       },
     },
   });
   ```

### Example Configuration

Assuming your `ngrok` URL is `https://abc123.ngrok.io`, your configuration would look like this:

```plaintext
const accountLink = await stripe.v2.accountLinks.create({
  account: rp_accountId,
  use_case: {
    type: 'account_onboarding',
    account_onboarding: {
      configurations: ['recipient'],
      refresh_url: 'https://abc123.ngrok.io/refresh',
      return_url: 'https://abc123.ngrok.io/return',
    },
  },
});
```

### Additional Resources
- **ngrok Documentation**: [ngrok's official documentation](https://ngrok.com/docs) provides detailed instructions on setting up and configuring `ngrok`.
- **Stripe Documentation**: For more details on configuring URLs and handling errors, see [Stripe's API Reference](https://docs.stripe.com/api).

By using `ngrok`, you can create secure, HTTPS URLs that point to your local development server, satisfying Stripe’s requirement for secure `return_url` and `refresh_url` fields.