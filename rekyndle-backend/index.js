const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const express = require("express");
const serverless = require("serverless-http");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const authenticateToken = require("./utils/auth.js");



const app = express();

const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

app.get("/users/:userId", async function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.send(new GetCommand(params));
    if (Item) {
      const { userId, name } = Item;
      res.json({ userId, name });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive user" });
  }
});
// Your existing route code
app.post("/users", async (req, res) => {
  let { name, email, password } = req.body;
  email = email.toLowerCase();

  // Check if user already exists
  const userExists = await dynamoDbClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        userId: email,
      },
    })
  );

  if (userExists.Item) {
    res.status(400).json({ error: "User already exists" });
    return;
  }

  try {
    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store the user in DynamoDB
    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId: email,
        name,
        email: email,
        password: hashedPassword,
      },
    };
    await dynamoDbClient.send(new PutCommand(params));
    // Generate JWT token with email as payload
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "User created successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();

  try {
    // Check if user exists in DynamoDB
    const user = await dynamoDbClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        userId: email,
      },
    }));

    if (!user.Item) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Compare the entered password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.Item.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    // Generate JWT token with email as payload
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not login user" });
  }
});


app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route' });
});
//TODO:route to bulk post highlights for a user ID
// TODO: route to get all highlights for a user ID
// TODO: route to get all post highlights for a user from clippings.io export 



app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});


module.exports.handler = serverless(app);
