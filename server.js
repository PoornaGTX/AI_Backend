import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

//error handler
import 'express-async-errors';

import morgan from 'morgan';

import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';

// db and authenticateUser
import connectDB from './db/connect.js';

// routers
import authRouter from './routes/authRoutes.js';
import pdfRouter from './routes/pdfHistory.js';

// middleware
import errorHandlerMiddleware from './middleware/error-handler.js';
import notFoundMiddleware from './middleware/not-found.js';
import authenticateUser from './middleware/auth.js';

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use(cors());

app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/history', authenticateUser, pdfRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listing on port : ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
