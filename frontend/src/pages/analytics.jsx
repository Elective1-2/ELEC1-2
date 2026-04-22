// src/pages/Analytics.jsx
import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import MobileHeader from "../components/MobileHeader";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import SummaryCards from "../components/analytics/SummaryCards";
import WeeklyRidershipChart from "../components/analytics/WeeklyRidershipChart";
import DelayHistoryChart from "../components/analytics/DelayHistoryChart";
import RoutePerformanceList from "../components/analytics/RoutePerformanceList";
import TripHistoryTable from "../components/analytics/TripHistoryTable";
import TripFilters from "../components/analytics/TripFilters";
import {
  useAnalyticsSummary,
  useWeeklyRidership,
  useDelayHistory,
  useRoutePerformance,
  useTripHistory,
  useRoutesWithTrips
} from "../hooks/useAnalytics";
import "../css/analytics.css";

// Helper function to format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function Analytics() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("Analytics");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    bus: '',
    route: '',
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0]
  });

  // Custom hooks for data fetching
  const { summary, loading: summaryLoading, refetch: refetchSummary } = useAnalyticsSummary();
  const { data: weeklyRidership, loading: ridershipLoading, refetch: refetchRidership } = useWeeklyRidership(weekOffset);
  const { data: delayHistory, loading: delayLoading, refetch: refetchDelay } = useDelayHistory(weekOffset);
  const { data: routePerformance, loading: performanceLoading, refetch: refetchPerformance } = useRoutePerformance(7);
  const { data: tripHistory, pagination, loading: tripsLoading, refetch: refetchTrips } = useTripHistory(filters);
  const { routes: routesForFilter, loading: routesLoading } = useRoutesWithTrips();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchSummary();
      refetchRidership();
      refetchDelay();
      refetchPerformance();
      refetchTrips();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchSummary, refetchRidership, refetchDelay, refetchPerformance, refetchTrips]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      bus: '',
      route: '',
      dateStart: new Date().toISOString().split('T')[0],
      dateEnd: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="analytics-root">
      <MobileHeader setMenuOpen={setMenuOpen} />
      <div className="analytics-body">
        <Sidebar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />
        <div className="analytics-main">
          <AdminNavbar />
          
          <div className="analytics-content">
            {/* Header */}
            <div className="analytics-header">
              <h1 className="analytics-title">Analytics Dashboard</h1>
              <div className="analytics-week-navigator">
                <button 
                  className="week-nav-btn"
                  onClick={() => setWeekOffset(prev => prev - 1)}
                >
                  ← Previous Week
                </button>
                <span className="week-range">
                  {formatDate(weeklyRidership.weekStart)} - {formatDate(weeklyRidership.weekEnd)}
                </span>
                <button 
                  className="week-nav-btn"
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  disabled={weekOffset === 0}
                >
                  Next Week →
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards summary={summary} loading={summaryLoading} />

            {/* Charts Row */}
            <div className="analytics-charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Weekly Ridership</h3>
                  <span className="chart-subtitle">Total passengers per day</span>
                </div>
                <WeeklyRidershipChart data={weeklyRidership} loading={ridershipLoading} />
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Delay History</h3>
                  <span className="chart-subtitle">Total delay minutes per day</span>
                </div>
                <DelayHistoryChart data={delayHistory} loading={delayLoading} />
              </div>
            </div>

            {/* Route Performance */}
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3>Route Performance (Last 7 Days)</h3>
                <span className="chart-subtitle">Top routes by total passengers</span>
              </div>
              <RoutePerformanceList data={routePerformance} loading={performanceLoading} />
            </div>

            {/* Trip History */}
            <div className="chart-card full-width">
              <div className="chart-header with-filter">
                <div>
                  <h3>Trip History</h3>
                  <span className="chart-subtitle">Completed trips</span>
                </div>
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'} 🔍
                </button>
              </div>

              {showFilters && (
                <TripFilters
                  filters={filters}
                  routes={routesForFilter}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              )}

              <TripHistoryTable
                data={tripHistory}
                loading={tripsLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>

            {/* Auto-refresh indicator */}
            <div className="analytics-refresh-info">
              <span className="refresh-icon">🔄</span>
              <span>Auto-refreshes every 30 seconds</span>
            </div>
          </div>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Analytics;