export const swaggerPaths = {
  "/api/v1/auth/login": {
    "post": {
      "tags": ["Authentication"],
      "summary": "Login to the platform",
      "description": "Authenticates user and returns JWT token",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["email", "password"],
              "properties": {
                "email": { "type": "string", "example": "user@example.com" },
                "password": { "type": "string", "example": "Password123!" }
              }
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Successful login" },
        "400": { "description": "Validation error" },
        "401": { "description": "Invalid credentials" }
      }
    }
  },
  "/api/v1/auth/register": {
    "post": {
      "tags": ["Authentication"],
      "summary": "Register a new user",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["email", "password", "firstName", "lastName"],
              "properties": {
                "email": { "type": "string" },
                "password": { "type": "string" },
                "firstName": { "type": "string" },
                "lastName": { "type": "string" }
              }
            }
          }
        }
      },
      "responses": { "201": { "description": "User created" } }
    }
  },
  "/api/v1/auth/refresh": {
    "post": {
      "tags": ["Authentication"],
      "summary": "Refresh access token",
      "responses": { "200": { "description": "Token refreshed" } }
    }
  },
  "/api/v1/auth/logout": {
    "post": {
      "tags": ["Authentication"],
      "summary": "Logout session",
      "responses": { "200": { "description": "Logged out" } }
    }
  },
  "/api/v1/products": {
    "get": {
      "tags": ["Products"],
      "summary": "List all products",
      "parameters": [
        { "name": "page", "in": "query", "schema": { "type": "integer" } },
        { "name": "limit", "in": "query", "schema": { "type": "integer" } }
      ],
      "responses": { "200": { "description": "List of products" } }
    }
  },
  "/api/v1/products/{id}": {
    "get": {
      "tags": ["Products"],
      "summary": "Get product details",
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "responses": { "200": { "description": "Product details" }, "404": { "description": "Not found" } }
    }
  },
  "/api/v1/categories": {
    "get": {
      "tags": ["Products"],
      "summary": "List categories",
      "responses": { "200": { "description": "List of categories" } }
    }
  },
  "/api/v1/collections": {
    "get": {
      "tags": ["Products"],
      "summary": "List collections",
      "responses": { "200": { "description": "List of collections" } }
    }
  },
  "/api/v1/search": {
    "get": {
      "tags": ["Products"],
      "summary": "Search products",
      "parameters": [
        { "name": "q", "in": "query", "required": true, "schema": { "type": "string" } }
      ],
      "responses": { "200": { "description": "Search results" } }
    }
  },
  "/api/v1/cart": {
    "get": {
      "tags": ["Customer"],
      "summary": "Get active cart",
      "security": [{ "BearerAuth": [] }],
      "responses": { "200": { "description": "Cart details" } }
    },
    "post": {
      "tags": ["Customer"],
      "summary": "Add item to cart",
      "security": [{ "BearerAuth": [] }],
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "variantId": { "type": "string" },
                "quantity": { "type": "integer" }
              }
            }
          }
        }
      },
      "responses": { "200": { "description": "Cart updated" } }
    }
  },
  "/api/v1/wishlist": {
    "get": {
      "tags": ["Customer"],
      "summary": "Get wishlist",
      "security": [{ "BearerAuth": [] }],
      "responses": { "200": { "description": "Wishlist details" } }
    }
  },
  "/api/v1/orders": {
    "get": {
      "tags": ["Customer"],
      "summary": "Order history",
      "security": [{ "BearerAuth": [] }],
      "responses": { "200": { "description": "List of orders" } }
    }
  },
  "/api/v1/checkout": {
    "post": {
      "tags": ["Checkout"],
      "summary": "Process checkout",
      "security": [{ "BearerAuth": [] }],
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "cartId": { "type": "string" },
                "paymentMethodCode": { "type": "string" },
                "shippingAddressId": { "type": "string" }
              }
            }
          }
        }
      },
      "responses": { "200": { "description": "Checkout initiated" } }
    }
  },
  "/api/v1/payment/verify": {
    "post": {
      "tags": ["Checkout"],
      "summary": "Verify online payment",
      "responses": { "200": { "description": "Payment verified" } }
    }
  },
  "/api/v1/ai/recommendations": {
    "get": {
      "tags": ["AI"],
      "summary": "Get AI recommendations",
      "responses": { "200": { "description": "Recommendations" } }
    }
  },
  "/api/v1/media/upload": {
    "post": {
      "tags": ["Media"],
      "summary": "Upload media to Cloudinary",
      "security": [{ "BearerAuth": [] }],
      "responses": { "201": { "description": "Uploaded successfully" } }
    }
  }
};
