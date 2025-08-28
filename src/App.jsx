import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { initializeSampleData } from "@/lib/storage";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Prices from "@/pages/Prices";
import Tanks from "@/pages/Tanks";
import Animals from "@/pages/Animals";
import Feed from "@/pages/Feed";
import DairyPrice from "@/pages/DairyPrice";
import DairyTanks from "@/pages/DairyTanks";
import MyDairies from "@/pages/MyDairies";
import Production from "@/pages/Production";
import Relatorios from "@/pages/Relatorios";
import Armazem from "@/pages/Armazem";
import { HelmetProvider } from "react-helmet-async";

initializeSampleData();

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* PRODUTOR */}
                <Route
                  path="prices"
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <Prices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tanks"
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <Tanks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="animals"
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <Animals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="feed"
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <Feed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="laticinios"
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <MyDairies />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="producao"
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <Production />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="relatorios"
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <Relatorios />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="armazem"
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <Armazem />
                    </ProtectedRoute>
                  }
                />

                {/* QUEIJEIRA / LATICÍNIO */}
                <Route
                  path="dairy-price"
                  element={
                    <ProtectedRoute requiredRole="dairy">
                      <DairyPrice />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dairy-tanks"
                  element={
                    <ProtectedRoute requiredRole="dairy">
                      <DairyTanks />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Wildcard (splat) */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
