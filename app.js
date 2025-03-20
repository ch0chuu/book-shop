const express = require('express')
const app = express()

const dotenv = require('dotenv');
dotenv.config();

app.listen(process.env.PORT);

const userRouter = require('./routes/user')
const bookRouter = require('./routes/books')
const likeRouter = require('./routes/likes')
const cartRouter = require('./routes/carts')
const orderRouter = require('./routes/orders')
const categoryRouter = require('./routes/category')


app.use("/users",userRouter)
app.use("/books",bookRouter)
app.use("/category", categoryRouter)
app.use("/likes",likeRouter)
app.use("/carts",cartRouter)
app.use("/orders",orderRouter)