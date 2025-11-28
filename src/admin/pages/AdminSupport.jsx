import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';
import StatisticsCards from '../components/StatisticsCards';
import EditRequestModal from '../components/EditRequestModal';
import ViewRequestModal from '../components/ViewRequestModal';
import SearchAndFilters from '../components/SearchAndFilters';
import RequestsTable from '../components/RequestsTable';
import Pagination from '../components/Pagination';
import ResolvedInfoModal from '../components/ResolvedInfoModal';

const AdminSupport = () => {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]); // Store all requests for client-side search
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalRequest, setModalRequest] = useState(null);
  const [modalNote, setModalNote] = useState('');
  const [editModalRequest, setEditModalRequest] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [showResolvedInfo, setShowResolvedInfo] = useState(false);

  const fetchRequests = async (pageToFetch = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pageToFetch };
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await axiosInstance.get('/api/service-requests/admin/all', {
        params,
      });
      const data = res?.data?.data || {};

      const fetchedRequests = data.requests || [];
      setAllRequests(fetchedRequests);
      setRequests(fetchedRequests);

      if (data.pagination) setPagination(data.pagination);
      if (data.statistics) setStatistics(data.statistics);
    } catch (err) {
      setError('Failed to load support requests');
      toast.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const statusOptions = useMemo(
    () => ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'],
    []
  );

  // Client-side search filtering
  const filteredRequests = useMemo(() => {
    if (!search || !search.trim()) {
      return requests;
    }

    const searchLower = search.trim().toLowerCase();
    return requests.filter((r) => {
      return (
        r.id?.toLowerCase().includes(searchLower) ||
        r.userId?.toLowerCase().includes(searchLower) ||
        r.user?.email?.toLowerCase().includes(searchLower) ||
        r.subject?.toLowerCase().includes(searchLower) ||
        r.message?.toLowerCase().includes(searchLower) ||
        r.user?.fullName?.toLowerCase().includes(searchLower) ||
        r.category?.toLowerCase().includes(searchLower) ||
        r.priority?.toLowerCase().includes(searchLower) ||
        r.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [requests, search]);

  const handleViewRequest = (request) => {
    setModalRequest(request);
    setModalNote('');
  };

  const handleEditRequest = (request) => {
    if (request.status === 'RESOLVED') {
      setShowResolvedInfo(true);
      return;
    }
    setEditModalRequest(request);
    setEditStatus(request.status || '');
    setEditNote('');
  };

  const handleCloseEditModal = () => {
    setEditModalRequest(null);
    setEditStatus('');
    setEditNote('');
  };

  const handleCloseViewModal = () => {
    setModalRequest(null);
  };

  const handleEditSuccess = (optimisticStatus) => {
    if (optimisticStatus) {
      setRequests((prev) =>
        prev.map((it) =>
          it.id === editModalRequest.id
            ? { ...it, status: optimisticStatus }
            : it
        )
      );
    }
    setEditModalRequest(null);
    setEditStatus('');
    setEditNote('');
    fetchRequests(page);
  };

  const handleViewSuccess = (optimisticStatus) => {
    if (optimisticStatus) {
      setRequests((prev) =>
        prev.map((it) =>
          it.id === modalRequest.id ? { ...it, status: optimisticStatus } : it
        )
      );
    }
    setModalRequest(null);
    fetchRequests(page);
  };

  return (
    <div className='container py-4'>
      {/* PAGE TITLE */}
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h3 className='fw-bold'>
          <i className='bi bi-life-preserver me-2'></i> Support Requests
        </h3>
      </div>

      {/* STAT CARDS */}
      <StatisticsCards statistics={statistics} />

      {/* MODALS */}
      <ResolvedInfoModal
        isOpen={showResolvedInfo}
        onClose={() => setShowResolvedInfo(false)}
      />

      <EditRequestModal
        editModalRequest={editModalRequest}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editNote={editNote}
        setEditNote={setEditNote}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      <ViewRequestModal
        modalRequest={modalRequest}
        modalNote={modalNote}
        setModalNote={setModalNote}
        onClose={handleCloseViewModal}
        onSuccess={handleViewSuccess}
      />

      {/* SEARCH + FILTERS */}
      <SearchAndFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
        setPage={setPage}
        onRefresh={() => fetchRequests(page)}
      />

      {/* REQUESTS TABLE */}
      <RequestsTable
        loading={loading}
        error={error}
        filteredRequests={filteredRequests}
        search={search}
        onViewRequest={handleViewRequest}
        onEditRequest={handleEditRequest}
      />

      {/* PAGINATION */}
      {requests.length > 5 && (
        <Pagination
          pagination={pagination}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default AdminSupport;
