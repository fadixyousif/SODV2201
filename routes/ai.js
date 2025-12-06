import express from 'express';
import Groq from 'groq-sdk';
import jwt from 'jsonwebtoken';
import sql from '../db.js';

// initialize groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// create express router
const router = express.Router();

// simple intent detection based on keywords
function detectIntents(message) {

    // convert message to lowercase for easier matching
    const msg = message.toLowerCase();

    // array to hold detected intents
    const intents = [];

    // check for keywords related to menu, specials, reservations if yes add menu intent
    if (msg.includes("menu") || msg.includes("food") || msg.includes("dish") || msg.includes("item") || msg.includes("eat") || msg.includes("drink") || msg.includes("dinner") || msg.includes("lunch") || msg.includes("breakfast") || msg.includes("appetizer") || msg.includes("starter") || msg.includes("main course") || msg.includes("dessert") || msg.includes("beverage") || msg.includes("ask")) {
        intents.push("menu");
    }
    
    // check for keywords related to reservations if yes add reservations intent
    if (msg.includes("reservation") || msg.includes("book") || msg.includes("table") || msg.includes("seat")  || msg.includes("ask")) {
        intents.push("reservations");
    }

    // check for keywords related to orders
    if (msg.includes("order") || msg.includes("history") || msg.includes("receipt") || msg.includes("past")) {
        intents.push("orders");
    }

    // if no specific intent detected, add general intent
    if (intents.length === 0) intents.push("general");

    return intents;
}

// function to get data from database based on intents
async function getData(intents, tokenData) {
    const result = {};

    // fetch menu items if menu intent detected
    if (intents.includes("menu")) {

        // query to get menu items
        const req = new sql.Request();

        // get only available items
        const menuItems = await req.query(`
            SELECT 
                mi.name AS itemName, 
                c.name AS categoryName, 
                mi.price, mi.description 
            FROM MenuItems mi 
            JOIN Categories c ON mi.categoryId = c.id 
            WHERE mi.available = 1 ORDER BY c.name, mi.name
        `);

        // structure menu items by category
        result.menu = menuItems.recordset;
    }

    //  fetch reservations if reservations intent detected
    if (intents.includes("reservations")) {
        // check if user is logged in by verifying tokenData
        if (tokenData && tokenData.email) {

            // query to get user's reservations
            const req = new sql.Request();

            // use email from token data to fetch reservations
            req.input('email', sql.VarChar(255), tokenData.email);

            // get reservations for the logged-in user
            const reservations = await req.query(`
                SELECT 
                    customerName, date, time, guests, status_response 
                FROM Reservations 
                WHERE email = @email ORDER BY date DESC, time DESC
            `);

            // add reservations to result
            result.reservations = reservations.recordset;
        } else {
            // user not logged in, return message prompting login
            result.reservations = { message: "Please log in to view your reservations." };
        }   
    }

    // fetch orders if orders intent detected
    if (intents.includes("orders")) {
        if (tokenData && tokenData.email) {
            const req = new sql.Request();
            req.input('email', sql.VarChar(255), tokenData.email);
            const orders = await req.query(`
                SELECT 
                    id, date, time, totalPrice, status, items 
                FROM Orders 
                WHERE email = @email ORDER BY date DESC, time DESC
            `);
            result.orders = orders.recordset;
        } else {
            result.orders = { message: "Please log in to view your order history." };
        }
    }

    // additional data fetching can be added here based on other intents
    return result;
}


router.post("/chatbot", async (req, res) => {
    // check if user has sent bareerer token then get token data
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
            req.tokenData = decoded; 
        } catch (err) { 
            // invalid token, ignore and proceed as guest
        }
    }

    // extract message and history from request body
    const { message, history } = req.body;

    // validate message
    if (!message) return res.status(400).json({ error: "Message is required" });

    // detect intents and fetch relevant data
    try {
        // detect intents from the message
        const intents = detectIntents(message);

        // fetch data based on detected intents and user token data
        const data = await getData(intents, req.tokenData);

        // construct system prompt with fetched data
        const systemPrompt = `
You are the AI assistant for a restaurant.
Your goal is to provide accurate and helpful information based strictly on the provided restaurant data.

### GUIDELINES:
- **Formatting**: Use bullet points, newlines, and bold text to make your responses easy to read. Avoid large blocks of text.
- **Identity**: You are a friendly and professional restaurant concierge.
- **Knowledge**: You only know what is provided in the "Restaurant Data" section below. Do not invent menu items or prices.
- **Menu & Specials**: When asked, describe items appealingly using the descriptions provided. Always mention the price.
- **Reservations**: 
- Check the 'reservations' field in the data.
- If it contains a "message" property saying "Please log in", ask the user to sign in.
- If it is an empty list [], tell the user they have no upcoming reservations.
- If it contains reservation items, summarize them (Date, Time, Guests).
- If the user asks to *make* a new reservation, politely inform them that you can only check existing ones, and they should use the website's reservation form.
- **Orders**:
- Check the 'orders' field in the data.
- If it contains a "message" property saying "Please log in", ask the user to sign in to view their order history.
- If it is an empty list [], tell the user they have no past orders.
- If it contains order items, summarize them (Date, Items, Total Price, Status).
- **General Queries**: If asked about hours or location and the data is missing, say "I don't have that information right now, but I can help with the menu!"
- **Off-Topic**: If the user strays from restaurant topics, politely bring the conversation back to food and dining.
- You should remember any restaurant-related details the user tells you during this conversation (preferences, allergies, favorite dishes). Only remember items that are relevant to helping with menu or dining recommendations.

### SYSTEM CONTEXT:
- Current Date: ${new Date().toLocaleDateString()}

### RESTAURANT DATA:
${JSON.stringify(data, null, 2)}
        `;

        // construct messages for the chat completion
        const messages = [{ role: "system", content: systemPrompt }];

        // include chat history if provided
        if (history && Array.isArray(history)) {
            // Accept both {role, content} and {sender, text} formats
            const validHistory = history
            // look for valid messages
                .map(msg => {
                    // check for role/content format
                    if (msg.role && msg.content) {
                        return { role: msg.role, content: msg.content };
                    }

                    // check for sender/text format
                    if (msg.sender && msg.text) {
                        return { 
                            role: msg.sender === 'user' ? 'user' : 'assistant', 
                            content: msg.text 
                        };
                    }
                    return null;
                })
                .filter(msg => msg !== null);
            // append valid history messages
            messages.push(...validHistory);
        }

        // add the current user message
        messages.push({ role: "user", content: message });

        // call groq chat completion API
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
        });

        // send back the AI response
        res.json({
            success: true,
            response: response.choices[0].message.content
        });

    } catch (err) {
        // handle errors
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to process the message" });
    }
});

// export the router
export default router;

