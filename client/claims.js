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

      try {

        // const claimName = document.getElementById('name-input').value;
        const claimName = 'JWick';
        const claimType = 'Medical';
        const claimEMailAddress = 'jw@example.com';
        const claimAddress = '10 Downing Street, London, SW14 4AA';
        const claimDetails = 'Medical bills';
        const claimPolicyId = 'CL12345678'
        const claimAmount = 101.00;
        const isBusinessClaim = false; 
        const claimFirstName  = 'John';
        const claimSurname = 'Wick';

        // Prevent multiple form submissions
        if (submitBtn.disabled) {
          return;
        }

        // Disable the submit button to prevent multiple submissions
        submitBtn.disabled = true;
    
        // Create recipient 
        const response = await fetch("/approve-claim", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json' // This line specifies the content type.
          },
          body: JSON.stringify({
            items: [{ 
              claimName: claimName,
              claimEMailAddress : claimEMailAddress,
              claimType: claimType,
              claimAddress: claimAddress,
              claimDetails: claimDetails,
              claimPolicyId : claimPolicyId,
              claimAmount : claimAmount,
              isBusinessClaim : isBusinessClaim,
              claimFirstName : claimFirstName,
              claimSurname : claimSurname,
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
          localStorage.setItem('rpAccount', rpj);  

          // Set the response data to the textbox
          document.getElementById('response-textbox').value = rpj;

          // // Store the rp_accountId in local storage (optional)
          // const rp_accountId = responseData.rp_accountId;
          // localStorage.setItem('rp_accountId', rp_accountId);

          // Alternatively, pass the rp_accountId as a query parameter in the URL
          // window.location.href = `/claimspay.html?rp_accountId=${rp_accountId}`;

          //window.location.href = '/claimspay.html';
        } 
        else {
          // Handle any errors
          const error = await response.json();
          console.error('Error:', error.message);
        }
      }
      catch (error) {
        console.error('Error:', error);
      }
      finally {
        submitBtn.disabled = false; // Re-enable the submit button
      }

    });
  })();
});
