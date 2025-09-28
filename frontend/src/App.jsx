import React from 'react'
import { Route, Routes } from 'react-router-dom'
import BillingHistory from './pages/payments/addCard.jsx'
import ProcessingPage from './pages/payments/ProcessingPage'
import SuccessPage from './pages/payments/SuccessPage'
import ChargePage from './pages/payments/ChargePage'
import CardManagementPage from './pages/payments/CardManagementPage'
import PaymentPage from './pages/payments/billingHistory'



const App = () => {
  return (
    <div>
    <Routes>
   
      <Route path="/saveCard" element={<BillingHistory />} />
      <Route path="/processing" element={<ProcessingPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/ChargePage" element={<ChargePage />} />
      <Route path="/CardManagementPage" element={<CardManagementPage />} />
      <Route path='/saveCard' element={<addCard/>}/>
      <Route path="/PaymentPage" element={<PaymentPage/>} />
      


    </Routes>  
    



    </div>
  )
}

export default App
