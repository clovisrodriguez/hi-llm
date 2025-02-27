require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

console.log("MONGO_URI", MONGO_URI);
// Connect to MongoDB
let db;
MongoClient.connect(MONGO_URI, {
  useNewUrlParser: true,
})
  .then(async (client) => {
    db = client.db("hillm-demo");
    console.log("Connected to MongoDB");

    // Check if products already exist; if not, create funny clothing products
    const productsCollection = db.collection("products");
    const count = await productsCollection.estimatedDocumentCount();
    if (count === 0) {
      const defaultProducts = [
        {
          title: "Hilarious Hoodie",
          description: "A hoodie that cracks jokes while keeping you warm.",
          price: 39.99,
          availability: 50,
        },
        {
          title: "Sassy Sneakers",
          description:
            "Sneakers with a bit of attitude and extra spring in your step.",
          price: 59.99,
          availability: 30,
        },
        {
          title: "Comical Cap",
          description: "A cap that's always ready with a witty remark.",
          price: 19.99,
          availability: 100,
        },
        {
          title: "Jolly Jacket",
          description: "A jacket so funny, even winter laughs.",
          price: 89.99,
          availability: 20,
        },
        {
          title: "Witty T-Shirt",
          description: "A t-shirt loaded with puns to brighten your day.",
          price: 24.99,
          availability: 80,
        },
      ];
      await productsCollection.insertMany(defaultProducts);
      console.log("Inserted default products");
    }
  })
  .catch((err) => console.error(err));

// Build GraphQL schema with updated types and queries
const schema = buildSchema(`
  type Query {
    product(id: ID!): Product
    products: [Product]
    order(orderId: ID!): Order
    ordersByEmail(email: String!): [Order]
  }

  type Mutation {
    submitOrder(productId: ID!, quantity: Int!, email: String!, shippingAddress: AddressInput!): OrderConfirmation
  }

  type Product {
    id: ID!
    title: String!
    description: String!
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
    email: String!
    status: String!
    createdAt: String!
  }

  type OrderConfirmation {
    orderId: ID!
    estimatedDelivery: String!
  }
`);

// Root resolvers with updated functionality using the database
const root = {
  product: async ({ id }) => {
    let product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });
    if (product) {
      product.id = product._id.toString();
      delete product._id;
    }
    return product;
  },
  products: async () => {
    let res = await db.collection("products").find().toArray();
    return res.map((product) => {
      product.id = product._id.toString();
      delete product._id;
      return product;
    });
  },
  submitOrder: async ({ productId, quantity, email, shippingAddress }) => {
    const productsCollection = db.collection("products");
    const product = await productsCollection.findOne({
      _id: new ObjectId(productId),
    });
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.availability < quantity) {
      throw new Error("Not enough availability");
    }
    // Deduct the quantity from availability
    await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { availability: -quantity } }
    );

    // Create order object with an email field
    const order = {
      productId,
      quantity,
      email,
      shippingAddress,
      status: "Processing",
      createdAt: new Date(),
    };
    const result = await db.collection("orders").insertOne(order);
    return {
      orderId: result.insertedId.toString(),
      estimatedDelivery: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // estimated 7 days later
    };
  },
  order: async ({ orderId }) => {
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
      email: order.email,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    };
  },
  ordersByEmail: async ({ email }) => {
    const orders = await db.collection("orders").find({ email }).toArray();
    return orders.map((order) => ({
      orderId: order._id.toString(),
      productId: order.productId,
      quantity: order.quantity,
      email: order.email,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }));
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
      // Updated SDL with funny clothing products and orders having email
      schemaSDL: `
type Query {
  product(id: ID!): Product
  products: [Product]
  order(orderId: ID!): Order
  ordersByEmail(email: String!): [Order]
}

type Mutation {
  submitOrder(productId: ID!, quantity: Int!, email: String!, shippingAddress: AddressInput!): OrderConfirmation
}

type Product {
  id: ID!
  title: String!
  description: String!
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
  email: String!
  status: String!
  createdAt: String!
}

type OrderConfirmation {
  orderId: ID!
  estimatedDelivery: String!
}`,
    },
    examples: {
      queries: [
        {
          description: "Get details for a funny clothing product",
          query: `query {
  product(id: "1") {
    title
    description
    price
    availability
  }
}`,
        },
        {
          description: "Get orders by email (e.g., funny@party.com)",
          query: `query {
  ordersByEmail(email: "funny@party.com") {
    orderId
    productId
    quantity
    email
    status
    createdAt
  }
}`,
        },
      ],
      mutations: [
        {
          description: "Submit a hilarious order",
          mutation: `mutation {
  submitOrder(
    productId: "2",
    quantity: 1,
    email: "funny@party.com",
    shippingAddress: {
      street: "123 Laugh Lane",
      city: "Joketown",
      postalCode: "00042",
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
