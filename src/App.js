import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './components/Dashboard';
import HotelList from './components/hotels/HotelList';
import ClientList from './components/clients/ClientList';
import NotFound from './components/NotFound';

// Version temporaire simplifiée des composants manquants
const HotelDetail = () => (
  <div className="container mt-4">
    <h1>Détail de l'hôtel</h1>
    <p>Page en construction...</p>
  </div>
);

const HotelForm = () => (
  <div className="container mt-4">
    <h1>Formulaire d'hôtel</h1>
    <p>Page en construction...</p>
  </div>
);

const Login = () => (
  <div className="container mt-4">
    <h1>Page de connexion</h1>
    <p>Page en construction...</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="py-3 flex-grow-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/hotels" element={<HotelList />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/hotels/add" element={<HotelForm />} />
            <Route path="/hotels/edit/:id" element={<HotelForm />} />
            <Route path="/clients" element={<ClientList />} />
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
    </Router>
  );
}

export default App;
