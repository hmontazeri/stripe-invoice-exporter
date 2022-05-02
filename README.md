# Stripe Invoice Exporter

Download all your Stripe PDF invoices in bulk.

This project is a fork of `dunglas/stripe-invoice-exporter`

# Prerequisites

You need a working installation of node.

# Install

1. Run `npm install` to install the Stripe SDK.
2. Export the invoice ids from the Stripe Dashboard as CSV. Remove all columns but `id`.
3. Create a new restricted key with the `Read` right for `Invoices` resource type:
   ![Screenshot](docs/restricted-key.png)
4. Copy the generated key.

# Usage

    STRIPE_KEY=rk_live_<...> node download.js

The invoices will be downloaded in the `invoices/` directory.
