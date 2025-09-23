import React from 'react'
import { Route, Routes } from 'react-router-dom'
import BillingHistory from './pages/payments/billingHistory'
import ProcessingPage from './pages/payments/ProcessingPage'
import SuccessPage from './pages/payments/SuccessPage'
import ChargePage from './pages/payments/ChargePage'


const App = () => {
  return (
    <div>
    <Routes>
   
      <Route path="/" element={<BillingHistory />} />
      <Route path="/processing" element={<ProcessingPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/ChargePage" element={<ChargePage />} />

    </Routes>  
    



    </div>
  )
}

export default App
