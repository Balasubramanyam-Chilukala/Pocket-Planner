import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Hackathon",
  password: "Balu@3738",
  port: 5432,
});


import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

let userr;

const app = express();
const port = 3000;
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Database connected successfully!");
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.render("index.ejs");
  });

  app.post("/home", async (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    userr = req.body.username;
    let users = [];
  
    try {
      const result = await db.query("SELECT * FROM users");
      users = result.rows;
  
      console.log(users);
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
  
      if (user) {
        console.log("User found:", user);
        res.render("home.ejs", { user });
      } else {
        res.send("User not found");
      }
    } catch (err) {
      console.error("Error executing query:", err.stack);
    }
  });
  
  app.get("/register", async (req, res) => {
    res.render("register.ejs");
  });

  app.post("/questions",(req,res)=>{
    console.log(req.body);
    const query = `
    INSERT INTO users (username, phone_number, email, password)
    VALUES ($1, $2, $3, $4)
  `;
  const values = [req.body.username, req.body.phn_number, req.body.email, req.body.password];
  userr = req.body.username;
  db.query(query, values, (err, result) => { 
    if (err) {
      console.error(err.stack);
      res.send("Error registering user");
      return;
      } else {
        console.log("User registered successfully");
        res.render("questions.ejs");
      }
      });
  })

  app.get("/login",(req, res) => {
    res.render("login.ejs");
  })

  let chatHistory = [];

app.get("/finbot", async (req, res) => {
    var a = await run();
    console.log();
    console.log(a);
    var x = "I'm here to help you with your financial questions. What would you like to know?";
    chatHistory.push({ role: "model", parts: [{ text: a }] });
      const obj = {
        a:x
      };
    res.render("recom.ejs", { obj : obj });
});

app.get("/expenses", async (req, res) => {
  const query = 'SELECT * FROM expenses WHERE username = $1';
  const values = [userr];
  const result = await db.query(query, values);
  console.log(result.rows);
  res.render("expenses.ejs", { expenses: result.rows });
});

app.get("/invest", async (req, res) => {
  res.render("invest.ejs"); // Render the invest.ejs page
});


app.post("/submit",(req,res)=>{
  console.log(req.body);

  res.render("expensesQ.ejs");
});

app.post("/update-expense",async (req,res)=>{
  console.log(req.body);
  try{
  const query = "SELECT * FROM expenses WHERE username = $1";
    const values = [userr];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const dbValues = result.rows[0];
    const transport = req.body.transport || 0;
    const emi = req.body.emi || 0;
    const rent = req.body.rent || 0;
    const groceries = req.body.groceries || 0;
    const travel = req.body.travel || 0;
    const miscellaneous = req.body.miscellaneous || 0;

    let curr = [];
curr.push(Number(result.rows[0].transport) + Number(req.body.transport || 0));
curr.push(Number(result.rows[0].emi) + Number(req.body.emi || 0));
curr.push(Number(result.rows[0].rent) + Number(req.body.rent || 0));
curr.push(Number(result.rows[0].groceries) + Number(req.body.groceries || 0));
curr.push(Number(result.rows[0].travel) + Number(req.body.travel || 0));
curr.push(Number(result.rows[0].miscellaneous) + Number(req.body.miscellaneous || 0));


    const quer = `
  UPDATE expenses
  SET petrol = $1,
      transport = $2,
      emi = $3,
      rent = $4,
      groceries = $5,
      travel = $6,
      education = $7,
      miscellaneous = $8
  WHERE username = $9
  RETURNING *
`;

const val = [0, curr[0], curr[1], curr[2], curr[3], curr[4], 0, curr[5], userr];
const ress = await db.query(quer, val);
console.log("Update Result with Returning:", ress.rows[0]);


    res.render("home.ejs");
  } catch (error) {
    console.error("Error updating expenses:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/eques",(req,res)=>{
  console.log(req.body);
  const query = `
    INSERT INTO expenses (username,petrol,transport,emi,rent,groceries,travel,education,miscellaneous)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
  const values = [userr, req.body.petrol, req.body.transport, req.body.emi,req.body.rent, req.body.groceries, req.body.travel,0, req.body.miscellaneous];
  db.query(query, values, (err, result) => { 
    if (err) {
      console.error(err.stack);
      res.send("Error registering user");
      return;
      } else {
        console.log("User registered successfully");
        res.render("subscriptionQ.ejs");
      }
      });
});
app.post("/subscription-ques", async (req, res) =>{
  console.log(req.body);
  try {
    const services = ['netflix', 'amazon', 'apple', 'spotify', 'aha', 'hotstar', 'sun'];
    for (const service of services) {
      const amount = req.body[`${service}-a`];
      const endDate = req.body[`${service}-d`];

      if (amount && endDate) {
        const query = `
          INSERT INTO subscriptions (username, subscription_name, amount, end_date)
          VALUES ($1, $2, $3, $4)
        `;
        const values = [userr, service, amount, endDate];

        await db.query(query, values);
        console.log(`${service} subscription inserted.`);
      }

    }
    res.render('finGoalQ.ejs');
  } catch (error) {
    console.error('Error inserting subscription data:', error);
  } 
});

app.get("/subscriptions", (req, res)=>{
  const query = 'SELECT * FROM subscriptions WHERE username=$1';  // Fetching all subscriptions
  const values = [userr];
    db.query(query, values)
        .then(result => {
            // Pass the subscription data as an object to EJS
            res.render('subscriptions.ejs', { subscriptions: result.rows });
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.send('Error fetching data');
        });
});

app.get('/cancel-subs/:id', (req, res) => {
  const subscriptionId = req.params.id; // Get the subscription ID from the URL parameter

  // Ensure that the query is properly formatted
  const query = 'DELETE FROM subscriptions WHERE id = $1'; // Corrected query

  // Execute the query
  db.query(query, [subscriptionId], (err, result) => {
      if (err) {
          console.error('Error canceling subscription:', err);
          return res.status(500).send('Error canceling subscription');
      }

      // Redirect to a page showing the updated subscription list or a success message
      res.redirect('/subscriptions'); // Replace with the appropriate route if necessary
  });
});

app.post('/add-subs', (req, res) => {
  console.log(req.body);
  // Get form data from the request body
  const { 'subs-name': subsName, 'subs-amount': subsAmount, 'end-date': endDate} = req.body;

  // Check if all fields are provided
  if (!subsName || !subsAmount || !endDate) {
    return res.status(400).send('All fields are required.');
  }

  // SQL query to insert subscription data into the database
  const query = `
    INSERT INTO subscriptions (subscription_name, amount, end_date, username)
    VALUES ($1, $2, $3, $4)
  `;

  // Execute the query with the form data and the username
  db.query(query, [subsName, subsAmount, endDate, userr], (err, result) => {
    if (err) {
      console.error('Error adding subscription:', err);
      return res.status(500).send('Error adding subscription');
    }

    // Redirect to the page displaying the list of subscriptions after successful insertion
    res.redirect('/subscriptions'); // Replace with the appropriate route for displaying subscriptions
  });
});


app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Check if chat history exists for the session
  let chat;
  if (chatHistory.length > 0) {
    chat = model.startChat({ history: chatHistory });
  } else {
    chat = model.startChat();
  }

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  const modelText = response.text();

  chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
  chatHistory.push({ role: "model", parts: [{ text: modelText }] });
  const chatText = chatHistory.map(message => message.parts[0].text)
  console.log(chatText);

  res.render('chat.ejs', { chatHistory });
});

app.get('/financial-goals', async (req, res) => {
  const username = userr;  // Replace with actual user logic (like session or JWT)

  try {
    // Query to get all goals for the logged-in user
    const result = await db.query('SELECT goal, saved, remaining FROM financialGoals WHERE username = $1', [username]);
    const goals = result.rows; // Extract rows from the result

    // Render the EJS template with the goals data
    res.render('finGoals.ejs', { goals });
  } catch (err) {
    console.error('Error fetching financial goals:', err);
    res.status(500).send('Error fetching financial goals. Please try again later.');
  }
});


app.post('/fin-goals', async (req, res) => {
  // Extract form data from the request
  const { 'fin-goal1': goalName1, 'fin-goal2': amountToSave1, 'fin-goal3': amountSaved1 } = req.body;
  const { 'fin-goal4': goalName2, 'fin-goal5': amountToSave2, 'fin-goal6': amountSaved2 } = req.body;
  const { 'fin-goal7': goalName3, 'fin-goal8': amountToSave3, 'fin-goal9': amountSaved3 } = req.body;
  const { 'fin-goal10': goalName4, 'fin-goal11': amountToSave4, 'fin-goal12': amountSaved4 } = req.body;

  // Assuming username is stored in the session or passed with the form
  const username = userr; // Replace this with actual logic

  try {
    // Insert each financial goal into the financialGoals table
    const insertQuery = `
      INSERT INTO financialGoals (username, saved, remaining,goal)
      VALUES ($1, $2, $3,$4), ($5, $6, $7,$8), ($9, $10, $11,$12), ($13, $14, $15,$16)
    `;

    const values = [
      username, parseFloat(amountSaved1), parseFloat(amountToSave1) - parseFloat(amountSaved1),goalName1,
      username, parseFloat(amountSaved2), parseFloat(amountToSave2) - parseFloat(amountSaved2),goalName2,
      username, parseFloat(amountSaved3), parseFloat(amountToSave3) - parseFloat(amountSaved3),goalName3,
      username, parseFloat(amountSaved4), parseFloat(amountToSave4) - parseFloat(amountSaved4),goalName4,
    ];

    // Execute the query
    await db.query(insertQuery, values);

    res.render("home.ejs"); // Redirect to a success page or return a success message
  } catch (err) {
    console.error('Error saving financial goals:', err);
    res.status(500).send('Error saving financial goals. Please try again later.');
  }
});


  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const prompt = "I want some assistance in finance. Can you help me with that?";
  chatHistory.push({ role: "user", parts: [{ text: prompt }] });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  