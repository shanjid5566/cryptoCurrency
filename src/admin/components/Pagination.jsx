import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
      <div className="text-muted small">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} results
      </div>
      
      <div className="d-flex gap-1 gap-md-2 align-items-center flex-wrap justify-content-center">
        <button 
          className="btn btn-outline-secondary btn-sm"
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            fontSize: '13px'
          }}
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div className="d-flex gap-1">
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            
            // Always show first page
            if (pageNumber === 1) {
              return (
                <button
                  key={pageNumber}
                  className={`btn btn-sm ${
                    currentPage === pageNumber
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  style={{
                    width: '36px',
                    height: '36px',
                    padding: '0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: currentPage === pageNumber ? '600' : '400'
                  }}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            }
            
            // Show ellipsis after first page if current page is far from start
            if (pageNumber === 2 && currentPage > 3) {
              return (
                <span key={pageNumber} className="px-1" style={{ color: '#6c757d', fontSize: '13px' }}>
                  ...
                </span>
              );
            }
            
            // Show current page and adjacent pages
            if (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) {
              return (
                <button
                  key={pageNumber}
                  className={`btn btn-sm ${
                    currentPage === pageNumber
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  style={{
                    width: '36px',
                    height: '36px',
                    padding: '0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: currentPage === pageNumber ? '600' : '400'
                  }}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            }
            
            // Show ellipsis before last page if current page is far from end
            if (pageNumber === totalPages - 1 && currentPage < totalPages - 2) {
              return (
                <span key={pageNumber} className="px-1" style={{ color: '#6c757d', fontSize: '13px' }}>
                  ...
                </span>
              );
            }
            
            // Always show last page
            if (pageNumber === totalPages) {
              return (
                <button
                  key={pageNumber}
                  className={`btn btn-sm ${
                    currentPage === pageNumber
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  style={{
                    width: '36px',
                    height: '36px',
                    padding: '0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: currentPage === pageNumber ? '600' : '400'
                  }}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            }
            
            return null;
          })}
        </div>
        
        <button 
          className="btn btn-outline-secondary btn-sm"
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            fontSize: '13px'
          }}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
