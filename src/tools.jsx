import CaloriesPage from './pages/calories/CaloriesPage'
import ProjectionPage from './pages/projection/ProjectionPage'

// Every tool in ko-tools. Adding an entry here creates its route and its link on the home page.
export const TOOLS = [
  {
    path: 'calories',
    title: 'Daily calorie visualizer',
    description: 'BMR, activity and exercise stacked into one day, with the deficit for a weekly loss target.',
    element: <CaloriesPage />,
  },
  {
    path: 'projection',
    title: 'Money projection',
    description: 'How long savings last at a monthly burn rate, with take-home income from salaries.',
    element: <ProjectionPage />,
  },
]
