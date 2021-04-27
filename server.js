const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe").Stripe(process.env.STRIPE_SECTET_KEY);
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/payment", (req, res) => {
  const { product, token } = req.body;
  const idempotencyKey = uuidv4();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: product.name,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/", (req, res) => {
  res.send("HEY THERE WELCOME TO HEROKU SERVER!!!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Listening to the port number: ${PORT}`);
});
