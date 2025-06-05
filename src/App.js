import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages existantes
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import EventList from './pages/EventList';
import EventForm from './pages/EventForm';
import ClientList from './pages/ClientList';

// Components existants
import HotelList from './components/hotels/HotelList';
import HotelDetail from './pages/HotelDetail';
import HotelForm from './components/hotels/HotelForm';
import ClientForm from './components/clients/ClientForm';
import NotFound from './components/NotFound';

// 🆕 NOUVEAUX IMPORTS AJOUTÉS
import EventHotelAssignments from './pages/EventHotelAssignments';
import HotelClientAssignment from './pages/HotelClientAssignment';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="py-3 flex-grow-1">
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            
            {/* Routes protégées */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Événements */}
            <Route path="/events" element={
              <ProtectedRoute>
                <EventList />
              </ProtectedRoute>
            } />
            
            <Route path="/events/new" element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            } />
            
            <Route path="/events/:id/edit" element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            } />
            
            {/* 🆕 GESTION DES HÔTELS PAR ÉVÉNEMENT */}
            <Route path="/events/:eventId/hotels" element={
              <ProtectedRoute>
                <EventHotelAssignments />
              </ProtectedRoute>
            } />
            
            <Route path="/assignments/:eventId/hotel/:assignmentId" element={
              <ProtectedRoute>
                <HotelClientAssignment />
              </ProtectedRoute>
            } />
            
            {/* Hôtels */}
            <Route path="/hotels" element={
              <ProtectedRoute>
                <HotelList />
              </ProtectedRoute>
            } />
            
            <Route path="/hotels/new" element={
              <ProtectedRoute>
                <HotelForm />
              </ProtectedRoute>
            } />
            
            <Route path="/hotels/:id/edit" element={
              <ProtectedRoute>
                <HotelForm />
              </ProtectedRoute>
            } />
            
            <Route path="/hotels/:id" element={
              <ProtectedRoute>
                <HotelDetail />
              </ProtectedRoute>
            } />
            
            {/* Clients */}
            <Route path="/clients" element={
              <ProtectedRoute>
                <ClientList />
              </ProtectedRoute>
            } />
            
            <Route path="/clients/new" element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            } />
            
            <Route path="/clients/:id/edit" element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </AuthProvider>
  );
}

export default App;
