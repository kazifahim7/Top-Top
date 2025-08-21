import express, { type Application, type Request, type Response } from 'express'
import cors from 'cors'


import notFound from './app/middleware/notFound.js'
import globalErrorHandler from './app/middleware/globalErrorHandler.js'
import router from './app/router/index.js'


const app: Application = express()


// parser 
app.use(express.json())
app.use(cors({
     origin: '*',
     credentials: true
}));
   

// api 

app.use("/api/v1", router)


app.get('/', (req: Request, res: Response) => {
     res.send('welcome to Zem jewellers project...')
})



app.use(notFound)

app.use(globalErrorHandler)

export default app