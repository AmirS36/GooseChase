import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SwipingTest from './components/SwipingTest';

const App = () => {
    return (
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/swiping-test" element={<SwipingTest />} />
      </Routes>
    );
  };
  
  export default App;