import React from 'react'
import { Route, Routes } from 'react-router-dom'
import BillingHistory from './pages/payments/billingHistory'
import ProcessingPage from './pages/payments/ProcessingPage'
import SuccessPage from './pages/payments/SuccessPage'


const App = () => {
  return (
    <div>
    <Routes>
   
      <Route path="/" element={<BillingHistory />} />
      <Route path="/processing" element={<ProcessingPage />} />
      <Route path="/success" element={<SuccessPage />} />


    </Routes>  
    



    </div>
  )
}

export default App
