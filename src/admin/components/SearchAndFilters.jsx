import React from 'react';

const SearchAndFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
  setPage,
  onRefresh,
}) => {
  return (
    <div className='card shadow-sm p-3 mb-4 rounded-3 border-0'>
      <div className='row g-3 align-items-center'>
        <div className='col-md-6'>
          <input
            type='text'
            className='form-control'
            placeholder='Search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className='col-md-3'>
          <select
            className='form-select'
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className='col-md-3 text-end'>
          <button className='btn btn-primary' onClick={onRefresh}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;
