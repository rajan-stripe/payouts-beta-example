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

  const stripe = Stripe(publishableKey, {
    apiVersion: '2020-08-27',
  });



  (async () => {
    
    const form = document.getElementById('claim-form');
    const submitBtn = document.querySelector(".submit-button");


    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // const { error } = await stripe.confirmSetup({
      //   elements,
      //   confirmParams: {
      //     return_url: 'http://localhost:4242/return.html',
      //   }
      // });

      // name = document.getElementById('name-input').innerText
      const claimName = 'JDoe';
      const claimType = 'Medical';
      const claimAddress = '10 Downing Street, London, SW14 4AA';
      const claimDetails = 'Medical bills';
      const claimPolicyId = 'CL12345678'
      const claimAmount = 101.00;


      // Prevent multiple form submissions
      if (submitBtn.disabled) {
        return;
      }


      // Create recipient 
      const res = await fetch("/approve-claim", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json' // This line specifies the content type.
        },
        body: JSON.stringify({
          items: [{ 
            claimName: claimName,
            claimType: claimType,
            claimAddress: claimAddress,
            claimDetails: claimDetails,
            claimPolicyId : claimPolicyId,
            claimAmount : claimAmount,
          }],
        }),
      });

      // if (error) {
      //   const messageContainer = document.querySelector('#error-message');
      //   messageContainer.textContent = error.message;
      // } 
      // else {

      // }



    });
  })();
});
