import express from 'express'
import { authRouter } from '../modules/auth/auth.router.js'
import { teamsRouter } from '../modules/Team/team.router.js'


const router = express.Router()

const moduleRouter = [
     {
          path: "/auth",
          route: authRouter
     },
     {
          path: "/team",
          route: teamsRouter
     },
    
     
]


moduleRouter.forEach((route) => router.use(route.path, route.route))


export default router