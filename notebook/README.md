# notebook

Local Notebook for Financial Recipient Payouts management


## Setup up v2 SDK Python

https://docs.corp.stripe.com/payouts-beta/how-payouts-work 
https://docs.corp.stripe.com/sdks-v2?lang=python 

```bash
%pip3 install git+https://ghp_********@github.com/stripe/stripe-python-next.git@v0.12.0

```
## Setup up Local Jupyter

For PDF downloads install pandoc
https://pandoc.org/installing.html
and 
nbconvert failed: PyQtWebEngine is not installed to support Qt PDF conversion. Please install `nbconvert[qtpdf]` to enable.

```bash

pip3 install stripe==0.12.0
pip3 install jupyter

OR
pip3 install -r requirements.txt
jupyter notebook 

browse to http://localhost:8888/tree 

Open CollinsonInsuranceClaimPayouts.ipynb
```
## References

https://towardsdatascience.com/how-to-convert-json-into-a-pandas-dataframe-100b2ae1e0d8


## Running Stripe Notebooks

https://confluence.corp.stripe.com/display/MLP/Hubble+Notebooks+Guide
