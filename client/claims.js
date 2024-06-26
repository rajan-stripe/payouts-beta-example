document.addEventListener('DOMContentLoaded', async () => {
  const { publishableKey } = await fetch('/config').then((r) => r.json());
  if (!publishableKey) {
    addMessage(
      'No publishable key returned from the server. Please check `.env` and try again'
    );
    alert('Please set your Stripe publishable API key in the .env file');
  }



  const { accountId } = await fetch('/accountid').then((r) => r.json());
  if (!accountId) {
    addMessage(
      'No accountId returned from the server. Please check `.env` and try again'
    );
    alert('Please set your accountId in the .env file');
  }

  const { accountName } = await fetch('/accountname').then((r) => r.json());
  if (!accountName) {
    addMessage(
      'No accountName returned from the server. Please check `.env` and try again'
    );
    alert('Please set your accountName in the .env file');
  }

  // const stripe = Stripe(publishableKey, {
  //   apiVersion: '2020-08-27',
  // });

  // Initialize Stripe
  
  var stripe = Stripe(publishableKey); // Replace with your actual publishable key

  const appearance = {
    theme: 'flat',
    variables: { colorPrimaryText: '#262626' }
  };

  const options = {
    // mode: 'setup',
    // amount: 1099,
    // currency: 'usd',
    // paymentMethodCreation: 'manual',
    // Fully customizable with appearance API.
    appearance: {
      theme: 'flat',
      variables: { colorPrimaryText: '#262626' }
    },
  };

  const loader = 'auto';
  const elements = stripe.elements({appearance, loader});

  // // Create Element instances
  // const linkAuthenticationElement = elements.create("linkAuthentication");

  // Create and mount the Address Element
  const addressElement = elements.create('address', {
    mode: 'shipping', // Use 'billing' for billing addresses
    autocomplete: {
      mode: "google_maps_api",
      apiKey: "AIzaSyCuE61a_NYB-QyGomjr93QfNbzMOOVzae8",
    },
    defaultValues: {
      name: 'Jane Doe',
      address: {
        line1: '354 Oyster Point Blvd',
        line2: '',
        city: 'South San Francisco',
        state: 'CA',
        postal_code: '94080',
        country: 'US',
      },
      phone: '+44 7400 123456',
    },
    allowedCountries: ['US'], // can change this in future
    
    fields: {
      phone: 'always',
    },
    validation: {
      phone: {
        required: 'never',
      },
    },

  });

// Passing in defaultValues is optional, but useful if you want to prefill consumer information to
// ease consumer experience.
// const paymentElement = elements.create('payment', {
//   defaultValues: {
//     billingDetails: {
//       name: 'John Doe',
//       phone: '888-888-8888',
//     },
//   },
// });

// Mount the Elements to their corresponding DOM node
// linkAuthenticationElement.mount("#link-authentication-element");
addressElement.mount("#address-element");
// paymentElement.mount("#payment-element");




  (async () => {
    
    const form = document.getElementById('claim-form');
    const submitBtn = document.querySelector(".submit-button");


    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {

        // Elements Address

        const addressElement = elements.getElement('address');

        const {complete, value} = await addressElement.getValue();
      
        if (complete) {
          console.log('address-element.value:', value);
          // return;
        }

        // const claimName = document.getElementById('name-input').value.trim();
        const claimEMailAddress = document.getElementById('email-input').value.trim();
        // const claimAddress = document.getElementById('address-input').value.trim();
        const claimAddress = value;

        const claimType = document.getElementById('claim-type').value.trim();
        const claimDescription = document.getElementById('claim-details').value.trim();
        const claimPolicyId =  document.getElementById('claim-policy').value.trim();
        const claimAmount = Number(document.getElementById('claim-amount').value.trim()).toFixed(2);
        const isBusinessClaim = false; 
        // var nameParts = claimName.split(' ');
        // const claimFirstName  =  nameParts[0];
        // const claimSurname = nameParts.length > 1 ? nameParts.slice(-1).join(' ') : '';;

        // const claimName = 'JWick';
        // const claimType = 'Medical';
        // const claimEMailAddress = 'rajan+rp-jw@stripe.com';
        // const claimAddress = '10 Downing Street, London, SW14 4AA';
        // const claimDescription = 'Medical bills';
        // const claimPolicyId = 'CL12345678';
        // const claimAmount = Number(101.00).toFixed(2);
        // const isBusinessClaim = false; 
        // const claimFirstName  = 'John';
        // const claimSurname = 'Wick';

        const claimDetails = {
          // claimName: claimName,
          claimType: claimType,
          claimEMailAddress: claimEMailAddress,
          claimAddress: claimAddress,
          claimDescription: claimDescription,
          claimPolicyId: claimPolicyId,
          claimAmount: claimAmount,
          isBusinessClaim: isBusinessClaim,
          // claimFirstName: claimFirstName,
          // claimSurname: claimSurname,
        };

        // Prevent multiple form submissions
        if (submitBtn.disabled) {
          return;
        }

        // Disable the submit button to prevent multiple submissions
        submitBtn.disabled = true;
    
        // Create recipient 
        const response = await fetch("/create-claim", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json' // This line specifies the content type.
          },
          body: JSON.stringify({
            items: [{ 
              claimDetails: claimDetails,
            }],
          }),
        });

         // Check the response status
        if (response.ok) {
          // Redirect the user to the desired page
          // Get the recipient account id returned
          const rpj = await response.json();

          
          const rps = JSON.stringify(rpj)
          // Store the rpAccount object in local storage
          console.log('RP Account Data Returned:', rpj);
          localStorage.setItem('rpAccount', rps);  

          // Store the JSON object in local storage
          localStorage.setItem('claimDetails', JSON.stringify(claimDetails));

          // Set the response data to the textbox
          document.getElementById('response-textbox').value = rps;

          // Store the rp_accountId in local storage (optional)
          // const rp_accountId = rpj.rp_accountId;
          // localStorage.setItem('rp_accountId', rp_accountId);

          // Alternatively, pass the rp_accountId as a query parameter in the URL
          // window.location.href = `/claimspay.html?rp_accountId=${rp_accountId}`;

          window.location.href = '/claims-getbank.html';
        } 
        else {
          // Handle any errors
          const error = await response.json();
          console.error('Error:', error);
          document.getElementById('response-textbox').value = `Error: ${JSON.stringify(error, null, 2)}`;

        }
      }
      catch (error) {
        console.error('Error while making request:', error);
        document.getElementById('response-textbox').value = `Error: ${JSON.stringify(error, null, 2)}`;
      }
      finally {
        submitBtn.disabled = false; // Re-enable the submit button
      }

    });
  })();
});
