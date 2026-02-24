import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import StudentDashboard from './components/StudentDashboard'
import TutorDashboard from './components/TutorDashboard'
import AdminDashboard from './components/AdminDashboard'
import FreelancerDashboard from './components/FreeLancerDashboard'
import StudentCreateGig from './components/Student_Gigs'
import FreelancerInfoForm from './components/FreelancerInfoForm'
import PaymentPage from './components/PaymentPage'
import BookingPaymentPage from './components/BookingPaymentPage'
import TutorProfileForm from './components/TutorProfileForm'
import FindTutors from './components/FindTutors'
import TutorProfileView from './components/TutorProfileView'

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ isolation: 'isolate' }}>
    <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
    <div style={{ pointerEvents: 'auto' }} className="relative z-0">
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/find-tutors' element={<FindTutors/>}/>
      <Route path='/tutor/:tutorId' element={<TutorProfileView/>}/>
      <Route path='/studentdashboard' element={<StudentDashboard/>}/>
      <Route path='/tutor-profile' element={<TutorProfileForm/>}/>
      <Route path='/tutordashboard' element={<TutorDashboard/>}/>
      <Route path='/admindashboard' element={<AdminDashboard/>}/>
      <Route path='/freelancerdashboard' element={<FreelancerDashboard/>}/>

      <Route path='/freelancer-info' element={<FreelancerInfoForm/>} />

      <Route path='/student_gigs' element={<StudentCreateGig/>}/>
      <Route path='/payment/:offerId' element={<PaymentPage/>} />
      <Route path='/booking-payment/:bookingId' element={<BookingPaymentPage/>} />

    </Routes>
    </div>
    </div>
  )
}

export default App