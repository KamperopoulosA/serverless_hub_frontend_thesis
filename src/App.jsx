import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './components/Layout/Header';
import PlatformsList from './pages/PlatformsList';
import PlatformForm from './pages/PlatformForm';
import PlatformDetail from './pages/PlatformDetail';
import PlatformSearch from './pages/PlatformSearch';
import PlatformRanking from './pages/PlatformRanking';
import DeployFunctionForm from './pages/DeployFunctionForm';
import CredentialsForm from './pages/CredentialsForm';

function App() {
    return (
        <UserProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<PlatformsList />} />
                            <Route path="/platforms/new" element={<PlatformForm />} />
                            <Route path="/platforms/:id" element={<PlatformDetail />} />
                            <Route path="/platforms/:id/edit" element={<PlatformForm />} />
                            <Route path="/search" element={<PlatformSearch />} />
                            <Route path="/ranking" element={<PlatformRanking />} />
                            <Route path="/deploy" element={<DeployFunctionForm />} />
                            <Route path="/credentials" element={<CredentialsForm />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </UserProvider>
    );
}

export default App;