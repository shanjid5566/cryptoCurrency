import React from 'react';

const StatisticsCards = ({ statistics }) => {
    if (!statistics) return null;

    const stats = [
        { title: "Total", value: statistics.total, color: "primary" },
        { title: "Open", value: statistics.open, color: "success" },
        { title: "Resolved", value: statistics.resolved, color: "danger" },
        { title: "Last 24h", value: statistics.recent24h, color: "warning" },
    ];

    return (
        <div className="row g-3 mb-4">
            {stats.map((item, i) => (
                <div className="col-md-3" key={i}>
                    <div className={`card shadow-sm p-4 border-0 rounded-1 bg-${item.color} text-white text-center`}>
                        <div className="fw-semibold text-white opacity-90 fs-6 mb-2">{item.title}</div>
                        <div className="fs-1 fw-bold text-white">{item.value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatisticsCards;
