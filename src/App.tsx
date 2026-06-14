import { ActivityProvider } from './context/ActivityContext';
import { ThemeProvider } from './context/ThemeContext';
import ActivityJournal from './components/ActivityJournal';
import './App.css';

/**
 * App Root Component
 * 
 * Sets up the Activity Journal application with:
 * - ThemeProvider for dark/light mode management
 * - ActivityProvider for global state management
 * - ActivityJournal main component
 * - Global CSS styling
 */
function App() {
  return (
    <ThemeProvider>
      <ActivityProvider>
        <ActivityJournal />
      </ActivityProvider>
    </ThemeProvider>
  );
}

export default App;
