import { Application } from 'express'
import { API_ROOT } from '../constant/application'

import General from './router'
import authRoutes from './user/authentication'
import userManagementRoutes from './user/management'
import communityrouter from './Community/routes/communityrouter'
import educationrouter from './Education/routes/educationroutes'
import gamerouter from './Gamification/routes/games.router'
import classificationrouter from './Classification/routes/classificationRoutes'
import Insightrouter from './Insight/routes/insightroutes'
import locationRouter from './Location/routes/location.routes'
import adminAuthRoutes from './admin/authentication'
import adminDashboardRoutes from './admin/dashboard'

const App = (app: Application) => {
    app.use(`${API_ROOT}`, General)
    app.use(`${API_ROOT}`, authRoutes)
    app.use(`${API_ROOT}/user`, userManagementRoutes)
    app.use(`${API_ROOT}/community`, communityrouter)
    app.use(`${API_ROOT}/`, educationrouter)
    app.use(`${API_ROOT}/game`, gamerouter)
    app.use(`${API_ROOT}/insight`, Insightrouter)
    app.use(`${API_ROOT}/classification`, classificationrouter)
    app.use(`${API_ROOT}`, locationRouter)
    app.use(`${API_ROOT}`, adminAuthRoutes)
    app.use(`${API_ROOT}`, adminDashboardRoutes)
}

export default App
