const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/hillm-demo";

// Connect to MongoDB
let db;
MongoClient.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    db = client.db();
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error(err));

// Hardcoded list of 5 products
const products = [
  { id: "1", name: "Product 1", price: 10.99, availability: 100 },
  { id: "2", name: "Product 2", price: 15.99, availability: 50 },
  { id: "3", name: "Product 3", price: 20.99, availability: 25 },
  { id: "4", name: "Product 4", price: 8.99, availability: 200 },
  { id: "5", name: "Product 5", price: 12.99, availability: 75 },
];

// Build GraphQL schema as defined in the HiLLM manifest
const schema = buildSchema(`
  type Query {
    product(id: ID!): Product
    products: [Product]
    order(orderId: ID!): Order
  }

  type Mutation {
    submitOrder(productId: ID!, quantity: Int!, shippingAddress: AddressInput!): OrderConfirmation
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    availability: Int!
  }

  input AddressInput {
    street: String!
    city: String!
    postalCode: String!
    country: String!
  }

  type Order {
    orderId: ID!
    productId: ID!
    quantity: Int!
    status: String!
    createdAt: String!
  }

  type OrderConfirmation {
    orderId: ID!
    estimatedDelivery: String!
  }
`);

// Root resolver
const root = {
  product: ({ id }) => products.find((p) => p.id === id),
  products: () => products,
  submitOrder: async ({ productId, quantity, shippingAddress }) => {
    // Find the product and check availability
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.availability < quantity) {
      throw new Error("Not enough availability");
    }
    // Deduct availability
    product.availability -= quantity;
    // Create order object
    const order = {
      productId,
      quantity,
      shippingAddress,
      status: "Processing",
      createdAt: new Date(),
    };
    // Insert order into MongoDB
    const result = await db.collection("orders").insertOne(order);
    return {
      orderId: result.insertedId.toString(),
      estimatedDelivery: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // estimated 7 days later
    };
  },
  order: async ({ orderId }) => {
    // Retrieve the order from MongoDB by its _id
    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      throw new Error("Order not found");
    }
    return {
      orderId: order._id.toString(),
      productId: order.productId,
      quantity: order.quantity,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    };
  },
};

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

// LLM Manifest endpoint
app.get("/llm-manifest.json", (req, res) => {
  res.json({
    llmProtocolVersion: "1.0",
    graphQLEndpoint: "/graphql",
    authentication: {
      type: "None",
      tokenUrl: null,
      scopes: [],
    },
    schema: {
      type: "GraphQL",
      introspection: true,
      // For brevity, the SDL is provided as a string literal here.
      schemaSDL: `
type Query {
  product(id: ID!): Product
  products: [Product]
}

type Mutation {
  submitOrder(productId: ID!, quantity: Int!, shippingAddress: AddressInput!): OrderConfirmation
}

type Product {
  id: ID!
  name: String!
  price: Float!
  availability: Int!
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
}`,
    },
    examples: {
      queries: [
        {
          description: "Get product details",
          query: `query {
  product(id: "1") {
    name
    price
    availability
  }
}`,
        },
      ],
      mutations: [
        {
          description: "Submit an order",
          mutation: `mutation {
  submitOrder(
    productId: "1", 
    quantity: 2, 
    shippingAddress: {
      street: "123 Main St",
      city: "Anytown",
      postalCode: "12345",
      country: "USA"
    }
  ) {
    orderId
    estimatedDelivery
  }
}`,
        },
      ],
    },
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
