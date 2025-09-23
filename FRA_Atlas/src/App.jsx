import LandingPage from "./groups/Landing_page";
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LandingPage />
      </AuthProvider>
    </Router>
  );
}

export default App;