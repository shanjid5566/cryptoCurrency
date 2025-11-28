import React from 'react';

const SimulationModal = ({
  showConfirm,
  showResult,
  simConfig,
  simInput,
  onSimInputChange,
  onCancelConfirm,
  onConfirmOk,
  onCloseResult
}) => {
  return (
    <>
      {showConfirm && (
        <div
          className='modal show d-block'
          tabIndex='-1'
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.15s ease-in-out' }}
          onClick={onCancelConfirm}
        >
          <div className='modal-dialog modal-dialog-centered' onClick={(e) => e.stopPropagation()} style={{ animation: 'slideInDown 0.25s ease-out' }}>
            <div className='modal-content'>
              <div className='modal-body text-center py-4'>
                <div className='mb-3' style={{ animation: 'scaleIn 0.25s ease-out' }}>
                  <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' fill='#ffc107' viewBox='0 0 16 16'>
                    <path d='M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z' />
                    <path d='M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z' />
                  </svg>
                </div>
                <h5 className='modal-title mb-3'>{simConfig.title}</h5>
                <div className='mb-3'>
                  <input
                    type='text'
                    className='form-control'
                    value={simInput}
                    onChange={(e) => onSimInputChange(e.target.value)}
                    placeholder='Optional message (shown in success)'
                    autoFocus
                  />
                </div>
                <div className='d-flex gap-2 justify-content-center'>
                  <button type='button' className='btn btn-secondary px-4' onClick={onCancelConfirm}>Cancel</button>
                  <button
                    type='button'
                    className='btn btn-primary px-4'
                    onClick={onConfirmOk}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResult && (
        <div className='modal show d-block' tabIndex='-1' style={{ backgroundColor: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.15s ease-in-out' }} onClick={onCloseResult}>
          <div className='modal-dialog modal-dialog-centered' onClick={(e) => e.stopPropagation()} style={{ animation: 'slideInDown 0.25s ease-out' }}>
            <div className='modal-content'>
              <div className='modal-body text-center py-4'>
                <div className='mb-3' style={{ animation: 'scaleIn 0.25s ease-out' }}>
                  <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' fill={simConfig.type === 'success' ? '#28a745' : '#dc3545'} viewBox='0 0 16 16'>
                    {simConfig.type === 'success' ? (
                      <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z' />
                    ) : (
                      <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z' />
                    )}
                  </svg>
                </div>
                <h5 className='modal-title mb-3'>{simConfig.title}</h5>
                <p className='text-muted mb-4'>{simConfig.message}</p>
                <button type='button' className='btn btn-primary px-4' onClick={onCloseResult}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimulationModal;
