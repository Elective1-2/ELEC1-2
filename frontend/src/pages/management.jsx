//! Delete Driver Assign Modal
import React, { useState } from "react";

import AdminNavbar from "../components/menu/AdminNavbar";
import MobileHeader from "../components/menu/MobileHeader";
import Sidebar from "../components/menu/Sidebar";
import Footer from "../components/menu/Footer";
import BusModal from "../components/BusModal";
import AssignmentModal from "../components/management/AssignmentModal";
import DeleteConfirmModal from "../components/management/DeleteConfirmModal";
import DriverModal from "../components/management/DriverModal";
import DriverAssignModal from "../components/management/DriverAssignModal";
import DriverAssignmentsModal from "../components/management/DriverAssignmentsModal";
import BusAssignmentsModal from "../components/management/BusAssignmentsModal";
import KebabMenu from "../components/menu/KebabMenu";

import { useRoutes } from "../hooks/useRoutes";
import { useBuses, useDrivers, useFilteredData } from "../hooks/useBuses";
import { useBusForm } from "../hooks/useBusForm";
import { useDriverForm } from "../hooks/useDriverForm";
import "../css/management.css";

function Management() {
  // ========== STATE VARIABLES ==========
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("Management");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDriverAssignmentsModalOpen, setIsDriverAssignmentsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Bus #205 is running 15 min late on Cubao route.", time: "5 min ago", read: false },
    { id: 2, message: "New driver assigned to Bus #312.", time: "1 hr ago", read: false },
    { id: 3, message: "Bus #101 maintenance scheduled for tomorrow.", time: "2 hrs ago", read: true },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isDriverAssignModalOpen, setIsDriverAssignModalOpen] = useState(false); //! Delete
  const [isBusAssignmentsModalOpen, setIsBusAssignmentsModalOpen] = useState(false);
  
  // Selected items
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalTitle, setModalTitle] = useState("Add New Bus");
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'bus' or 'driver'
  const [deleting, setDeleting] = useState(false);

  // ========== DATA FETCHING HOOKS ==========
  const { buses, loading: busesLoading, error: busesError, refetch: refetchBuses } = useBuses();
  const { drivers, loading: driversLoading, error: driversError, refetch: refetchDrivers } = useDrivers();
  const { routes, loading: routesLoading } = useRoutes();
  
  // ========== FORM HOOKS ==========
  const { createBus, updateBus, deleteBus, loading: busFormLoading } = useBusForm(() => {
    refetchBuses();
    refetchDrivers();
  });
  const { updateDriver, deleteDriver, assignDriver, loading: driverFormLoading } = useDriverForm(() => {
    refetchBuses();
    refetchDrivers();
  });

  // ========== DERIVED STATE ==========
  const filteredBuses = useFilteredData(buses, searchTerm, ['bus_number', 'plate_number']);
  const filteredDrivers = useFilteredData(drivers, searchTerm, ['full_name', 'email']);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ========== HANDLERS ==========
  const handleSearchChange = (value) => setSearchTerm(value);
  
  // Bus handlers
  const handleAddBus = () => {
    setSelectedBus(null);
    setModalTitle("Add New Bus");
    setIsBusModalOpen(true);
  };
  
  const handleEditBus = (bus) => {
    setSelectedBus(bus);
    setModalTitle("Edit Bus");
    setIsBusModalOpen(true);
  };
  
  const handleManageBusAssignments = (bus) => {
    setSelectedBus(bus);
    setIsBusAssignmentsModalOpen(true);
  };
  
  const handleModalSubmit = async (formData) => {
    if (selectedBus) {
      return await updateBus(selectedBus.bus_id, formData);
    } else {
      return await createBus(formData);
    }
  };
  
  // Driver handlers
  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setIsDriverModalOpen(true);
  };
  
  const handleAssignDriver = (driver) => {
    setSelectedDriver(driver);
    setIsDriverAssignmentsModalOpen(true);
  };
  
  const handleDriverUpdate = async (formData) => {
    return await updateDriver(selectedDriver.user_id, formData);
  };
  
  const handleDriverAssign = async (formData) => {
    return await assignDriver(selectedDriver.user_id, formData);
  };
  
  // Delete handlers
  const openDeleteModal = (type, item) => {
    setDeleteType(type);
    setDeleteTarget(item);
    setDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    
    if (deleteType === 'bus') {
      const result = await deleteBus(deleteTarget.bus_id);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    } else if (deleteType === 'driver') {
      const result = await deleteDriver(deleteTarget.user_id);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    }
    
    setDeleting(false);
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteType(null);
  };

  // Helper functions for displaying assignments
  const getPrimaryAssignment = (bus) => {
    if (!bus.assignments || bus.assignments.length === 0) return null;
    return bus.assignments[0];
  };
  

  // ========== RENDER ==========
  return (
    <div className="mgmt-root">
      <MobileHeader setMenuOpen={setMenuOpen} />
      <div className="mgmt-body">
        <Sidebar 
          menuOpen={menuOpen} 
          setMenuOpen={setMenuOpen} 
          activePage={activePage} 
          setActivePage={setActivePage} 
        />
        <div className="mgmt-main">
          <AdminNavbar onSearchChange={handleSearchChange} initialSearchValue={searchTerm} />
          <div className="mgmt-content">

            {/* DEBUG of Search */}
            {/* {searchTerm && (
              <div className="mgmt-search-info">
                Showing results for: <strong>"{searchTerm}"</strong>
              </div>
            )} */}

            {/* ========== BUSES TABLE ========== */}
            <div className="mgmt-table-card">
              <div className="mgmt-table-header">
                <span className="mgmt-table-title">List of Buses</span>
                <button className="mgmt-add-btn" onClick={handleAddBus}>+ Add New Bus</button>
              </div>
              <div className="mgmt-table-scroll">
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      <th>Bus ID</th>
                      <th>Plate Number</th>
                      <th>Assigned Routes & Drivers</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {busesLoading ? (
                      <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>Loading buses...</td></tr>
                    ) : busesError ? (
                      <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>Error: {busesError}</td></tr>
                    ) : filteredBuses.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>{searchTerm ? "No buses match your search" : "No buses found"}</td></tr>
                    ) : (
                      filteredBuses.map((bus) => {
                        const assignments = bus.assignments || [];
                        return (
                          <tr key={bus.bus_id}>
                            <td className="mgmt-bold">{bus.bus_number}</td>
                            <td>{bus.plate_number || "—"}</td>
                            <td>
                              {assignments.length > 0 ? (
                                <div className="mgmt-assignments-list">
                                  {assignments.map((assignment, idx) => (
                                    <div key={assignment.assignment_id} className="mgmt-assignment-item">
                                      <div className="mgmt-assignment-main">
                                        <span className="mgmt-route-badge">{assignment.route_name}</span>
                                        <span className="mgmt-driver-badge">
                                          Driver: {assignment.driver_name}
                                        </span>
                                      </div>
                                      {assignment.start_location && assignment.end_location && (
                                        <small className="mgmt-route-details">
                                          {assignment.start_location} → {assignment.end_location}
                                        </small>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="mgmt-no-assignment">No assignments</span>
                              )}
                            </td>
                            <td>{bus.capacity} seats</td>
                            <td>
                              <span className={`mgmt-status-badge ${bus.status}`}>
                                {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                              </span>
                            </td>
                            <td className="mgmt-action-cell">
                              <KebabMenu
                                onEdit={() => handleEditBus(bus)}
                                onAssign={() => handleManageBusAssignments(bus)}
                                onDelete={() => openDeleteModal('bus', bus)}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========== DRIVERS TABLE ========== */}
            <div className="mgmt-table-card">
              <div className="mgmt-table-header">
                <span className="mgmt-table-title">Drivers</span>
                <button 
                  className="mgmt-add-btn" 
                  disabled 
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  title="Drivers are added via Google Authentication only"
                >
                  + Add Driver (via Google Auth)
                </button>
              </div>
              <div className="mgmt-table-scroll">
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Assigned Buses</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driversLoading ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>Loading drivers...</td></tr>
                    ) : driversError ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>Error: {driversError}</td></tr>
                    ) : filteredDrivers.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>{searchTerm ? "No drivers match your search" : "No drivers found"}</td></tr>
                    ) : (
                      filteredDrivers.map((driver) => {
                        const assignments = driver.assignments || [];
                        return (
                          <tr key={driver.user_id}>
                            <td className="mgmt-bold">{driver.full_name}</td>
                            <td>
                              {assignments.length > 0 ? (
                                <div className="mgmt-assignments-list">
                                  {assignments.map((assignment, idx) => (
                                    <div key={assignment.assignment_id} className="mgmt-assignment-item">
                                      <span className="mgmt-bus-badge">
                                        {assignment.bus_number}
                                        {assignment.plate_number && ` (${assignment.plate_number})`}
                                      </span>
                                      <span className="mgmt-route-badge">{assignment.route_name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="mgmt-no-assignment">—</span>
                              )}
                            </td>
                            <td>
                              <div>{driver.email}</div>
                              {driver.phone && <small>{driver.phone}</small>}
                            </td>
                            <td>
                              <span className={`mgmt-status-badge ${driver.is_active ? 'active' : 'inactive'}`}>
                                {driver.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="mgmt-action-cell">
                              <KebabMenu
                                onEdit={() => handleEditDriver(driver)}
                                onAssign={() => handleAssignDriver(driver)}
                                onDelete={() => openDeleteModal('driver', driver)}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* ========== MODALS ========== */}
      
      {/* Bus Modal */}
      <BusModal
        isOpen={isBusModalOpen}
        onClose={() => setIsBusModalOpen(false)}
        bus={selectedBus}
        drivers={drivers}
        onSubmit={handleModalSubmit}
        title={modalTitle}
      />

      {/* Bus Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        bus={selectedBus}
        drivers={drivers}
        routes={routes}
        onAssign={() => {
          refetchBuses();
          refetchDrivers();
        }}
      />

      {/* Driver Edit Modal */}
      <DriverModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        driver={selectedDriver}
        onSubmit={handleDriverUpdate}
        title="Edit Driver"
      />

      {/* Driver Assignment Modal */}
      <DriverAssignmentsModal
        isOpen={isDriverAssignmentsModalOpen}
        onClose={() => setIsDriverAssignmentsModalOpen(false)}
        driver={selectedDriver}
        buses={buses}
        routes={routes}
        onUpdate={() => {
          refetchBuses();
          refetchDrivers();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Confirmation"
        message={`Are you sure you want to delete this ${deleteType}?`}
        itemName={deleteType === 'bus' ? deleteTarget?.bus_number : deleteTarget?.full_name}
        loading={deleting}
      />

      {/* Bus Assignment modals */}
      <BusAssignmentsModal
        isOpen={isBusAssignmentsModalOpen}
        onClose={() => setIsBusAssignmentsModalOpen(false)}
        bus={selectedBus}
        drivers={drivers}
        routes={routes}
        onUpdate={() => {
          refetchBuses();
          refetchDrivers();
        }}
      />
    </div>
  );
}

export default Management;