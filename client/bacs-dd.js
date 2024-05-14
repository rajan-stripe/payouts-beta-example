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
    const response = await fetch('/secret');
    const { client_secret: clientSecret } = await response.json();
    addMessage(`Client secret returned.`);
    const loader = 'auto'
    const elements = stripe.elements({ clientSecret, loader });
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');

    const form = document.getElementById('payment-form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: 'http://localhost:4242/return.html',
        }
      });

      if (error) {
        const messageContainer = document.querySelector('#error-message');
        messageContainer.textContent = error.message;
      } else {
      }
    });
  })();
});
