const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const path = require("path");

const schema = buildSchema(`
  type Query {
    product(id: ID!): Product
    products: [Product]
  }

  type Mutation {
    submitOrder(orderInput: OrderInput!): OrderConfirmation
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    availability: Int!
  }

  input ProductFilter {
    category: String
    priceRange: PriceRange
  }

  input PriceRange {
    min: Float
    max: Float
  }

  input OrderInput {
    productId: ID!
    quantity: Int!
    shippingAddress: AddressInput!
  }

  input AddressInput {
    street: String!
    city: String!
    postalCode: String!
    country: String!
  }

  type OrderConfirmation {
    orderId: ID!
    estimatedDelivery: String!
  }
`);

const PRODUCTS_DB = [
  { id: "101", name: "Laptop", price: 999.99, availability: 5 },
  { id: "102", name: "Headphones", price: 49.99, availability: 20 },
  { id: "103", name: "Smartphone", price: 799.99, availability: 10 },
];

const root = {
  product: ({ id }) => {
    return PRODUCTS_DB.find((p) => p.id === id) || null;
  },
  products: () => PRODUCTS_DB,
  submitOrder: ({ orderInput }) => {
    // Simulation of an order submission
    const newOrderId = Math.floor(Math.random() * 1000000).toString();
    return {
      orderId: newOrderId,
      estimatedDelivery: "2025-01-31",
    };
  },
};

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/llm-manifest.json", (req, res) => {
  res.sendFile(path.join(__dirname, "llm-manifest.json"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HiLLM PoC server running on http://localhost:${PORT}`);
});
