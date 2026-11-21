import { Outlet } from 'react-router'

// Shared shell for every route — put a nav bar or footer here when you add pages.
export default function RootLayout() {
  return <Outlet />
}
