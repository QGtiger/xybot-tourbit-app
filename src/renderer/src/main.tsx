import './main.css'

import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { initRoutes } from './utils/pagerouter'

const router = createHashRouter(initRoutes())

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
