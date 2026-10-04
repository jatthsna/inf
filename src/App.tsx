import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './services/db';
import { AcademicYear } from './types';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Student feature pages
import { StudentDashboard } from './features/student/StudentDashboard';
import { StudentBills } from './features/student/StudentBills';
import { StudentRekap } from './features/student/StudentRekap';
import { StudentArrears } from './features/student/StudentArrears';
import { StudentTransparency } from './features/student/StudentTransparency';

// Admin & Treasurer feature pages
import { AdminDashboard } from './features/admin/AdminDashboard';
import { PaymentsPage } from './features/admin/PaymentsPage';
import { CashPaymentModal } from './features/admin/CashPaymentModal';
import { BillsPage } from './features/admin/BillsPage';
import { PaymentLinksPage } from './features/admin/PaymentLinksPage';
import { StudentsPage } from './features/admin/StudentsPage';
import { ClassesPage } from './features/admin/ClassesPage';
import { ArrearsPage } from './features/admin/ArrearsPage';
import { IncomePage } from './features/admin/IncomePage';
import { ExpensesPage } from './features/admin/ExpensesPage';
import { MonthlyRecapPage } from './features/admin/MonthlyRecapPage';
import { YearlyRecapPage } from './features/admin/YearlyRecapPage';
import { ReportsPage } from './features/admin/ReportsPage';
import { AuditLogPage } from './features/admin/AuditLogPage';
import { AcademicYearsPage } from './features/admin/AcademicYearsPage';
import { UserAccountsPage } from './features/admin/UserAccountsPage';
import { SettingsPage } from './features/admin/SettingsPage';
import { StudentQuickPayPortal } from './features/public/StudentQuickPayPortal';
import { AdminLoginModal } from './components/auth/AdminLoginModal';

interface MainAppProps {
  onViewStudentPortal?: () => void;
}

function MainApp({ onViewStudentPortal }: MainAppProps) {
  const { currentUser, role, isAdmin, isTreasurer } = useAuth();
  
  // Active Academic Year
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => db.getAcademicYears());
  const [selectedYearId, setSelectedYearId] = useState<string>(() => db.getActiveAcademicYear().id);

  // Active Tab
  const [currentTab, setCurrentTab] = useState<string>(() => {
    return (role === 'admin' || role === 'treasurer') ? 'admin-dashboard' : 'student-dashboard';
  });

  // Mobile sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Standalone cash modal trigger if opened from quick menu
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setAcademicYears(db.getAcademicYears());
    });
    return unsub;
  }, []);

  // Update default tab when user switches role or logs in
  useEffect(() => {
    if (role === 'student') {
      if (currentTab.startsWith('admin-')) {
        setCurrentTab('student-dashboard');
      }
    } else {
      if (currentTab.startsWith('student-')) {
        setCurrentTab('admin-dashboard');
      }
    }
  }, [role]);

  const activeAcademicYear = academicYears.find(y => y.id === selectedYearId) || academicYears[0];

  const handleSelectAcademicYear = (yearId: string) => {
    setSelectedYearId(yearId);
  };

  const handleSelectTab = (tabId: string) => {
    if (tabId === 'admin-cash') {
      setIsCashModalOpen(true);
      return;
    }
    // Block student from switching to admin tabs
    if (role === 'student' && tabId.startsWith('admin-')) {
      return;
    }
    setCurrentTab(tabId);
  };

  const renderContent = () => {
    // Role protection guard
    if (role === 'student' && currentTab.startsWith('admin-')) {
      return (
        <StudentDashboard
          activeAcademicYear={activeAcademicYear}
          onNavigateTab={handleSelectTab}
        />
      );
    }
    switch (currentTab) {
      // Student Views
      case 'student-dashboard':
        return (
          <StudentDashboard
            activeAcademicYear={activeAcademicYear}
            onNavigateTab={handleSelectTab}
          />
        );
      case 'student-bills':
        return <StudentBills activeAcademicYear={activeAcademicYear} />;
      case 'student-rekap':
        return <StudentRekap activeAcademicYear={activeAcademicYear} />;
      case 'student-arrears':
        return <StudentArrears activeAcademicYear={activeAcademicYear} />;
      case 'student-transparency':
        return <StudentTransparency activeAcademicYear={activeAcademicYear} />;

      // Admin & Treasurer Views
      case 'admin-dashboard':
        return (
          <AdminDashboard
            activeAcademicYear={activeAcademicYear}
            onNavigateTab={handleSelectTab}
          />
        );
      case 'admin-payments':
        return <PaymentsPage activeAcademicYear={activeAcademicYear} />;
      case 'admin-bills':
        return <BillsPage activeAcademicYear={activeAcademicYear} />;
      case 'admin-payment-links':
        return <PaymentLinksPage />;
      case 'admin-students':
        return <StudentsPage activeAcademicYear={activeAcademicYear} onNavigateTab={handleSelectTab} />;
      case 'admin-classes':
        return <ClassesPage />;
      case 'admin-arrears':
        return <ArrearsPage activeAcademicYear={activeAcademicYear} />;
      case 'admin-income':
        return <IncomePage activeAcademicYear={activeAcademicYear} />;
      case 'admin-expenses':
        return <ExpensesPage activeAcademicYear={activeAcademicYear} />;
      case 'admin-monthly-recap':
        return <MonthlyRecapPage activeAcademicYear={activeAcademicYear} />;
      case 'admin-yearly-recap':
        return <YearlyRecapPage activeAcademicYear={activeAcademicYear} />;
      case 'admin-reports':
        return <ReportsPage activeAcademicYear={activeAcademicYear} />;
      case 'admin-audit':
        return <AuditLogPage />;
      case 'admin-academic-years':
        return (
          <AcademicYearsPage
            activeAcademicYear={activeAcademicYear}
            onSelectYear={handleSelectAcademicYear}
          />
        );
      case 'admin-users':
        return <UserAccountsPage />;
      case 'admin-settings':
        return <SettingsPage onNavigateTab={handleSelectTab} />;

      default:
        return (
          <StudentDashboard
            activeAcademicYear={activeAcademicYear}
            onNavigateTab={handleSelectTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Navbar
            onToggleSidebar={() => setSidebarOpen(true)}
            activeAcademicYear={activeAcademicYear}
            onSelectAcademicYear={handleSelectAcademicYear}
            onViewStudentPortal={onViewStudentPortal}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Standalone Cash Payment Modal Trigger */}
      <CashPaymentModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        academicYearId={activeAcademicYear.id}
      />
    </div>
  );
}

function RootApp() {
  const { isAuthenticated, currentUserNullable, role } = useAuth();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [viewAsStudent, setViewAsStudent] = useState(false);

  // If not logged in as Admin or Treasurer, or if admin explicitly wants to preview the student portal
  if (!isAuthenticated || !currentUserNullable || (role !== 'admin' && role !== 'treasurer') || viewAsStudent) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        {viewAsStudent && (
          <div className="bg-emerald-950 border-b border-emerald-500/30 px-4 py-2.5 text-xs flex items-center justify-between text-emerald-200 sticky top-0 z-50 shadow-md">
            <span className="font-medium flex items-center gap-1.5">
              <span>● Mode Pratinjau Pengurus: Anda sedang melihat Portal Pembayaran Mahasiswa (Publik)</span>
            </span>
            <button
              onClick={() => setViewAsStudent(false)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
            >
              Kembali ke Dashboard Pengurus
            </button>
          </div>
        )}
        <StudentQuickPayPortal
          onOpenAdminLogin={() => {
            if (isAuthenticated && (role === 'admin' || role === 'treasurer')) {
              setViewAsStudent(false);
            } else {
              setIsAdminLoginOpen(true);
            }
          }}
        />
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      </div>
    );
  }

  return <MainApp onViewStudentPortal={() => setViewAsStudent(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}
