import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import OrderDetails from './pages/orders/OrderDetails'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/order/:salecode" element={<OrderDetails />} />
      </Routes>
    </Router>
  )
}

export default App
