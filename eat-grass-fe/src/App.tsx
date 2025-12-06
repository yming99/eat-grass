import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Home from './pages/Home'
import MealDetails from './pages/MealDetails'
import Planner from './pages/Planner'
import Profile from './pages/Profile'
import SavedPlans from './pages/SavedPlans'
import SocialFeed from './pages/SocialFeed'
import Settings from './pages/Settings'
import Cook from './pages/Cook'
import FindFoodNearby from './pages/FindFoodNearby'
import GroceryGame from './pages/GroceryGame'
import ReceiptVerification from './pages/ReceiptVerification'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="meal/:id" element={<MealDetails />} />
          <Route path="planner" element={<Planner />} />
          <Route path="profile" element={<Profile />} />
          <Route path="cook" element={<Cook />} />
          <Route path="find-food-nearby" element={<FindFoodNearby />} />
          <Route path="grocery-game" element={<GroceryGame />} />
          <Route path="receipt-verification" element={<ReceiptVerification />} />
          <Route path="saved-plans" element={<SavedPlans />} />
          <Route path="social-feed" element={<SocialFeed />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
