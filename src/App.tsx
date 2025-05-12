import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// Main App component
export default function App() {
  return <RouterProvider router={router} />;
}