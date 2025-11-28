import React from 'react';

const TradeModeForm = ({ tradeMode, setTradeMode, customWinRate, setCustomWinRate, updateTradeMode }) => {
    return (
        <div className='col-md-6'>
            <div className='card p-3'>
                <h6>Set Trade Outcome Mode:</h6>
                <div className='form-check'>
                    <input className='form-check-input' type='radio' name='tradeMode' value='always_win' checked={tradeMode === 'always_win'} onChange={() => setTradeMode('always_win')} />
                    <label className='form-check-label'>Always Win (100% Win Rate)</label>
                </div>
                <div className='form-check'>
                    <input className='form-check-input' type='radio' name='tradeMode' value='always_lose' checked={tradeMode === 'always_lose'} onChange={() => setTradeMode('always_lose')} />
                    <label className='form-check-label'>Always Lose (0% Win Rate)</label>
                </div>
                <div className='form-check'>
                    <input className='form-check-input' type='radio' name='tradeMode' value='random' checked={tradeMode === 'random'} onChange={() => setTradeMode('random')} />
                    <label className='form-check-label'>Random (Default ~50%)</label>
                </div>
                <div className='form-check'>
                    <input className='form-check-input' type='radio' name='tradeMode' value='custom' checked={tradeMode === 'custom'} onChange={() => setTradeMode('custom')} />
                    <label className='form-check-label'>Custom Win Rate</label>
                </div>

                {tradeMode === 'custom' && (
                    <div className='mt-3'>
                        <label className='form-label'>Custom Win Rate: {customWinRate}%</label>
                        <input type='range' className='form-range' min='0' max='100' value={customWinRate} onChange={(e) => setCustomWinRate(parseInt(e.target.value))} />
                        <div className='d-flex justify-content-between'>
                            <small>0%</small>
                            <small>50%</small>
                            <small>100%</small>
                        </div>
                    </div>
                )}

                <button className='btn btn-success mt-3' onClick={updateTradeMode}>💾 Save Mode</button>
            </div>
        </div>
    );
};

export default TradeModeForm;
