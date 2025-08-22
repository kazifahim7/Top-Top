import express from 'express'
import { authRouter } from '../modules/auth/auth.router.js'
import { categoryRouter } from '../modules/Category/category.router.js'

const router = express.Router()

const moduleRouter = [
     {
          path: "/auth",
          route: authRouter
     },
     {
          path: "/category",
          route: categoryRouter
     },
     
]


moduleRouter.forEach((route) => router.use(route.path, route.route))


export default router