import { createBrowserRouter } from 'react-router'
import RootLayout from './RootLayout'
import HomePage from './pages/HomePage'
import NotFound from './pages/NotFound'
import { TOOLS } from './tools'

// Tools are registered in ./tools.jsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      ...TOOLS.map(({ path, element }) => ({ path, element })),
      { path: '*', element: <NotFound /> },
    ],
  },
])
