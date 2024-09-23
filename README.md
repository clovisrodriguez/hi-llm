# HiLLM Protocol

*Hello, LLM agents and developers!*

## Introduction

Welcome to the **HiLLM Protocol**, an open standard designed to make websites more accessible and interactive for Large Language Models (LLMs). By implementing this protocol, website owners can say "Hi" to LLMs, inviting AI assistants to understand and perform actions on their sites seamlessly. Our goal is to bridge the gap between traditional web interfaces and AI-driven interactions, enhancing user experiences and paving the way for advanced AI-assisted services.

## Why "HiLLM"?

The name **HiLLM** embodies our mission:

- **"Hi"** – A universal greeting, representing openness and hospitality.
- **"LLM"** – Referring to Large Language Models, the AI agents we aim to engage.

By combining these elements, we're extending a warm invitation to AI assistants to interact with web content more effectively.

## Problem Statement

- **Inefficient Data Access:** LLMs currently parse through HTML/CSS designed for human users, leading to inefficiencies and potential errors.
- **Limited Interaction Capability:** Without standardized backend access, performing user actions (like form submissions or transactions) is complex for AI assistants.
- **Accessibility Barriers:** Users relying on AI assistants miss out on rich web experiences due to these limitations.

## Proposed Solution

Develop an open, standardized protocol that allows websites to expose their data structures and available actions directly to LLMs. This protocol operates alongside existing web technologies, enabling seamless integration without disrupting current user experiences.

## Technical Description

### Metadata Implementation

Websites implementing the HiLLM Protocol provide metadata to guide LLMs in interacting with their services.

**Meta Tags in HTML**

Include meta tags in the `<head>` section of your HTML to point to the `llm-manifest.json` file:

```html
<meta name="llm-protocol-version" content="1.0">
<meta name="llm-manifest" content="/llm-manifest.json">
```

**llm-manifest.json File**

The llm-manifest.json file is a comprehensive descriptor that includes:

-	GraphQL Endpoint Information
-	Authentication Requirements
-	GraphQL Schema Definitions
-	Example Queries and Mutations

**Detailed GraphQL Schema in llm-manifest.json**

By including the GraphQL schema definitions within the llm-manifest.json, LLMs can:

- **Understand Data Structures**: Know what queries and mutations are available.
- **Construct Valid Requests**: Formulate correct queries and mutations based on the schema.
- **Interpret Responses Accurately**: Anticipate the structure of responses for better interaction.

**Example llm-manifest.json**

```
{
  "llmProtocolVersion": "1.0",
  "graphQLEndpoint": "/graphql",
  "authentication": {
    "type": "OAuth2",
    "tokenUrl": "/auth/token",
    "scopes": ["read:products", "write:orders"]
  },
  "schema": {
    "type": "GraphQL",
    "introspection": true,
    "schemaSDL": "
      type Query {
        product(id: ID!): Product
        products(filter: ProductFilter): [Product]
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
    "
  },
  "examples": {
    "queries": [
      {
        "description": "Get product details",
        "query": "
          query {
            product(id: \"123\") {
              name
              price
              availability
            }
          }
        "
      }
    ],
    "mutations": [
      {
        "description": "Submit an order",
        "mutation": "
          mutation {
            submitOrder(orderInput: {
              productId: \"123\",
              quantity: 2,
              shippingAddress: {
                street: \"123 Main St\",
                city: \"Anytown\",
                postalCode: \"12345\",
                country: \"USA\"
              }
            }) {
              orderId
              estimatedDelivery
            }
          }
        "
      }
    ]
  }
}
```

## Benefits


**For Users**

Imagine a world where your personal AI assistant can seamlessly interact with any website to perform tasks on your behalf. With the HiLLM Protocol:

-	**Rise of Personal Assistants**: Users can rely on AI assistants to handle a multitude of services without switching between different apps or websites.
-	**Unified Experience**: Ask your assistant to order a meal, book a hotel, and schedule a doctor’s appointment—all through a single conversation.
-	**Increased Accessibility**: Users with disabilities or those who prefer voice interactions gain better access to online services.

**User Example**


You’re planning a last-minute weekend getaway. You tell your AI assistant:

_-	“Book me a hotel in Paris near the Eiffel Tower for this weekend.”_

The assistant accesses hotel websites implementing the HiLLM Protocol, checks availability, and books a room for you.

_-	“Also, reserve a table for two at a nice French restaurant on Saturday night.”_

It interacts with restaurant booking platforms, confirms your reservation, and adds it to your calendar.

All this happens seamlessly because the assistant can communicate directly with the services’ backends, thanks to the HiLLM Protocol.


**For Website Owners**

-	**Increased Engagement**: Seamless AI interactions can lead to higher user satisfaction and retention.
-	**Competitive Edge**: Stand out by offering AI-friendly services that enhance user convenience.
-	**Broader Reach**: Tap into the growing number of users who prefer interacting through AI assistants.

  

**For Developers**

-	**Simplified Integration**: Standardized protocols reduce development time and effort.
-	**Future-Proofing**: Stay ahead in the evolving landscape of AI and web interactions.
-	**Community Collaboration**: Benefit from shared improvements in an open-source environment.

  

## License

**Code**

The code in this repository is licensed under the Apache License 2.0. You may obtain a copy at:

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

Documentation

The documentation and specifications are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). View the full text at:

[CC BY 4.0 License](!https://creativecommons.org/licenses/by/4.0/deed.en)

Contribution Guide

We welcome contributions from developers, AI enthusiasts, and anyone interested in shaping the future of web-AI integration.

Join the Discussion

•	Discord Server: Connect with us for real-time discussions.
Join the HiLLM Protocol Discord Server

How to Contribute

1.	Feedback and Suggestions:
  •	Open an issue on GitHub to provide feedback or propose features.
2.	Development:
  •	Fork the repository and submit pull requests with enhancements or fixes.
3.	Documentation:
  •	Help improve the documentation by editing existing content or adding new sections.
4.	Spread the Word:
  •	Share the project with others who might be interested in contributing.

Contact Information

-	Project Lead: Clovis Rodríguez
-	Email: clovis1992@gmail.com
-	X (Twitter): [@ClovisRodrguez](https://x.com/ClovisRodrguez)
- LinkedIn: https://www.linkedin.com/in/clovisrodriguez/

_Let’s work together to create a more AI-friendly web!_
