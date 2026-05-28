import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import DashboardLayout from './pages/DashboardLayout'
import DashboardStats from './pages/DashboardStats'
import AddProduct from './pages/products/AddProduct'
import Inventory from './pages/products/Inventory'
import OrderSystem from './pages/orders/OrderSystem'
import OrderHistory from './pages/orders/OrderHistory'
import OrderDetails from './pages/orders/OrderDetails'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/order/:productCode" element={<OrderDetails />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardStats />} />
            <Route path="products" element={<Inventory />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="orders" element={<OrderSystem />} />
            <Route path="orders/history" element={<OrderHistory />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
