import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PageTransition from './components/PageTransition/PageTransition';

import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';

import StudentDashboard from './pages/StudentDashboard/Dashboard';
import SubmitIdea from './pages/StudentDashboard/SubmitIdea';
import MyIdeas from './pages/StudentDashboard/MyIdeas';
import MergedIdeasStudent from './pages/StudentDashboard/MergedIdeas';
import ExploreIdeas from './pages/StudentDashboard/ExploreIdeas';
import StudentGroups from './pages/StudentDashboard/Groups';
import StudentSettings from './pages/Settings/Settings';

import TeacherDashboard from './pages/TeacherDashboard/Dashboard';
import ReviewIdeas from './pages/TeacherDashboard/ReviewIdeas';
import Ideas from './pages/TeacherDashboard/Ideas';
import ApprovedIdeas from './pages/TeacherDashboard/ApprovedIdeas';
import MergedIdeasTeacher from './pages/TeacherDashboard/MergedIdeas';
import MergeSelect from './pages/TeacherDashboard/MergeSelect';
import Students from './pages/TeacherDashboard/Students';
import TeacherSettings from './pages/Settings/Settings';

import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ManageUsers from './pages/AdminDashboard/ManageUsers';
import AllIdeas from './pages/AdminDashboard/AllIdeas';

import Notifications from './pages/Notifications/Notifications';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <PageTransition>
            <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard/submit-idea"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SubmitIdea />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard/my-ideas"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyIdeas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard/merged-ideas"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MergedIdeasStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard/groups"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentGroups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard/explore-ideas"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExploreIdeas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard/notifications"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSettings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard/review"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <ReviewIdeas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard/ideas"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Ideas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard/approved"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <ApprovedIdeas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard/merged"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MergedIdeasTeacher />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard/merge-select"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MergeSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard/students"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard/notifications"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherSettings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/ideas"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AllIdeas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/notifications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </PageTransition>
        </Router>
        </ToastProvider>
      </ThemeProvider>
      </AuthProvider>
  );
}

export default App;
