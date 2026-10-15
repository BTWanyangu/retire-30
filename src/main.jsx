import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Gallery from './pages/Gallery.jsx';
import PrintTicket from './pages/PrintTicket.jsx';
import Auth from './pages/Auth.jsx';
import './styles.css';
import Support from './pages/Support.jsx';
import BookingResults from './pages/BookingResults.jsx';
import PassengerDetails from './pages/PassengerDetails.jsx';
import BookingPayment from './pages/BookingPayment.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/booking/results" element={<BookingResults />} />
          <Route path="/booking/passengers" element={<PassengerDetails />} />
          <Route path="/booking/payment" element={<BookingPayment />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/print-ticket" element={<PrintTicket />} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/sign-up" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
