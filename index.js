// import required modules
import express from 'express';
import cors from 'cors';

// import routers and db connection
import authRouter from './routes/auth.js';
import menuRouter from './routes/menu.js';
import ordersRouter from './routes/orders.js';
import reservationsRouter from './routes/reservations.js';
import aiRouter from './routes/ai.js';

// create an express application
const app = express();

// enable CORS and JSON parsing middleware
app.use(cors());
app.use(express.json());

// mount routers
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/ai', aiRouter);

// return a 404 for any undefined routes
app.use((req, res) => {
    res.status(404).send({ code: 404, message: 'Not Found' });
});

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));