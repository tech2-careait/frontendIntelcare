import React, { useState } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

import "../../../Styles/newGraphs.css";

const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f59e0b",
    "#10b981",
    "#3b82f6"
];

/* ---------------- SAMPLE DATA ---------------- */

const BAR_DATA = {
    x: ["Dept A", "Dept B", "Dept C", "Dept D", "Dept E", "Dept F"],
    series: {
        Revenue: [12000, 18000, 14000, 21000, 22200, 23000],
        Expense: [7000, 11000, 9000, 13000, 16000, 20000]
    }
};

const LINE_DATA = {
    x: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    series: {
        Revenue: [20000, 23000, 22000, 25000, 27000],
        Expense: [15000, 16000, 15500, 17000, 17500]
    }
};

const PIE_DATA = {
    labels: ["Revenue", "Expense", "Operations", "Marketing"],
    values: [23000, 8700, 4200, 3200]
};

const STACKED_DATA = {
    x: ["Project A", "Project B", "Project C", "Project D"],
    series: {
        Planning: [40, 30, 20, 50],
        Development: [120, 100, 80, 150],
        Testing: [60, 50, 40, 70],
        Deployment: [20, 15, 10, 25]
    }
};
const formatYAxis = (value) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(0) + "K";
    }
    return value;
};
/* ---------------- TOOLTIP ---------------- */

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-visualizer-tooltip">
                <div className="chart-visualizer-tooltip-label">{label}</div>

                {payload.map((p, i) => (
                    <div key={i} className="chart-visualizer-tooltip-row">

                        <span className="chart-visualizer-tooltip-left">
                            <span
                                className="chart-visualizer-tooltip-dot"
                                style={{ background: p.color || p.fill }}
                            />
                            {p.name}
                        </span>

                        <span className="chart-visualizer-tooltip-value">
                            {formatYAxis(p.value)}
                        </span>

                    </div>
                ))}
            </div>
        );
    }
    return null;
};

/* ---------------- LEGEND ---------------- */

const Legend = ({ names, visible, toggle }) => {

    return (
        <div className="chart-visualizer-legend">

            {names.map((name, i) => (
                <div
                    key={name}
                    className={`chart-visualizer-legend-item ${visible.includes(name)
                        ? ""
                        : "chart-visualizer-legend-item-inactive"
                        }`}
                    onClick={() => toggle(name)}
                >

                    <span
                        className="chart-visualizer-legend-dot"
                        style={{ background: COLORS[i % COLORS.length] }}
                    />

                    <span className="chart-visualizer-legend-text">
                        {name}
                    </span>

                </div>
            ))}

        </div>
    );
};

/* ---------------- BAR CHART ---------------- */

const BarChartWrapper = ({ data, meta }) => {

    const names = Object.keys(data.series);
    const [visible, setVisible] = useState(names);

    const toggle = name => {
        setVisible(prev =>
            prev.includes(name)
                ? prev.filter(v => v !== name)
                : [...prev, name]
        );
    };

    const chartData = data.x.map((x, i) => {
        const obj = { name: x };

        names.forEach(n => {
            obj[n] = data.series[n][i];
        });

        return obj;
    });

    return (

        <div>

            <Legend names={names} visible={visible} toggle={toggle} />

            <ResponsiveContainer width="100%" height={350}>

                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                >

                    <XAxis
                        dataKey="name"
                        label={{
                            value: meta?.x_label,
                            position: "insideBottom",
                            offset: -10
                        }}
                    />

                    <YAxis
                        tickFormatter={formatYAxis}
                        label={{
                            value: meta?.y_label,
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle" }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {names.map((n, i) => (
                        <Bar
                            key={n}
                            dataKey={n}
                            fill={COLORS[i]}
                            hide={!visible.includes(n)}
                            barSize={40}              // thinner bar
                            radius={[8, 8, 0, 0]}        // rounded top corners
                        />
                    ))}

                </BarChart>

            </ResponsiveContainer>

        </div>
    );
};

/* ---------------- LINE CHART ---------------- */

const LineChartWrapper = ({ data, meta }) => {

    const names = Object.keys(data.series);
    const [visible, setVisible] = useState(names);

    const toggle = name => {
        setVisible(prev =>
            prev.includes(name)
                ? prev.filter(v => v !== name)
                : [...prev, name]
        );
    };

    const chartData = data.x.map((x, i) => {
        const obj = { name: x };

        names.forEach(n => {
            obj[n] = data.series[n][i];
        });

        return obj;
    });

    return (

        <div>

            <Legend names={names} visible={visible} toggle={toggle} />

            <ResponsiveContainer width="100%" height={350}>

                <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                >
                    <XAxis
                        dataKey="name"
                        label={{
                            value: meta?.x_label,
                            position: "insideBottom",
                            offset: -10
                        }}
                    />

                    <YAxis
                        tickFormatter={formatYAxis}
                        label={{
                            value: meta?.y_label,
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle" }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {names.map((n, i) => (
                        <Area
                            key={n}
                            dataKey={n}
                            stroke={COLORS[i]}
                            fill={COLORS[i]}
                            fillOpacity={0.2}
                            hide={!visible.includes(n)}
                            strokeWidth={3}
                            dot={{ r: 4 }}          // shows dot on each point
                            activeDot={{ r: 6 }}    // bigger dot on hover
                        />
                    ))}

                </AreaChart>

            </ResponsiveContainer>

        </div>
    );
};

/* ---------------- PIE CHART ---------------- */

const PieChartWrapper = ({ data }) => {

    const names = data.labels;
    const [visible, setVisible] = useState(names);

    const toggle = name => {
        setVisible(prev =>
            prev.includes(name)
                ? prev.filter(v => v !== name)
                : [...prev, name]
        );
    };

    const chartData = data.labels.map((l, i) => ({
        name: l,
        value: visible.includes(l)
            ? (data.values?.[i] ?? data.series?.values?.[i] ?? 0)
            : 0, // hide by setting value 0
        color: COLORS[i]
    }));

    return (
        <div>

            <Legend names={names} visible={visible} toggle={toggle} />

            <ResponsiveContainer width="100%" height={350}>

                <PieChart>

                    <Pie
                        data={chartData}
                        dataKey="value"
                        innerRadius={100}     // donut hole
                        outerRadius={140}
                        paddingAngle={6}      // space between slices
                        cornerRadius={0}      // rounded slice edges
                    >
                        {chartData.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={entry.color}
                            />
                        ))}
                    </Pie>

                    <Tooltip content={<CustomTooltip />} />

                </PieChart>

            </ResponsiveContainer>

        </div>
    );
};

/* ---------------- STACKED BAR ---------------- */

const StackedBarChartWrapper = ({ data, meta }) => {

    const names = Object.keys(data.series);
    const [visible, setVisible] = useState(names);

    const toggle = name => {
        setVisible(prev =>
            prev.includes(name)
                ? prev.filter(v => v !== name)
                : [...prev, name]
        );
    };

    const chartData = data.x.map((x, i) => {
        const obj = { name: x };

        names.forEach(n => {
            obj[n] = data.series[n][i];
        });

        return obj;
    });

    return (

        <div>

            <Legend names={names} visible={visible} toggle={toggle} />

            <ResponsiveContainer width="100%" height={350}>

                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                >
                    <XAxis
                        dataKey="name"
                        label={{
                            value: meta?.x_label,
                            position: "insideBottom",
                            offset: -10
                        }}
                    />

                    <YAxis
                        tickFormatter={formatYAxis}
                        label={{
                            value: meta?.y_label,
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle" }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {names.map((n, i) => {

                        const isTop = i === names.length - 1;

                        return (
                            <Bar
                                key={n}
                                dataKey={n}
                                stackId="a"
                                fill={COLORS[i]}
                                hide={!visible.includes(n)}
                                barSize={40}
                                radius={isTop ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                            />
                        );

                    })}

                </BarChart>

            </ResponsiveContainer>

        </div>
    );
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function ChartVisualiser({ plotData, plotName }) {
    if (!plotData) return null;

    const chartType = plotData.type;
    const meta = plotData.meta || {};
    return (
        <div className="chart-visualizer-app">

            {chartType === "bar" && (
                <div className="chart-visualizer-card">
                    <div className="chart-header">

                        <div className="chart-title">
                            {meta?.title || plotName}
                        </div>

                        {meta?.y_label && (
                            <div className="chart-subtitle">
                                {meta.y_label.toUpperCase()}
                            </div>
                        )}

                    </div>

                    <BarChartWrapper data={plotData} meta={meta} />
                </div>
            )}

            {chartType === "line" && (
                <div className="chart-visualizer-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            {meta?.title || plotName}
                        </div>

                        {meta?.y_label && (
                            <div className="chart-subtitle">
                                {meta.y_label.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <LineChartWrapper data={plotData} meta={meta} />
                </div>
            )}

            {chartType === "area" && (
                <div className="chart-visualizer-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            {meta?.title || plotName}
                        </div>

                        {meta?.y_label && (
                            <div className="chart-subtitle">
                                {meta.y_label.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <LineChartWrapper data={plotData} meta={meta} />
                </div>
            )}

            {chartType === "pie" && (
                <div className="chart-visualizer-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            {meta?.title || plotName}
                        </div>

                        {meta?.y_label && (
                            <div className="chart-subtitle">
                                {meta.y_label.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <PieChartWrapper data={plotData} meta={meta} />
                </div>
            )}

            {chartType === "stacked_bar" && (
                <div className="chart-visualizer-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            {meta?.title || plotName}
                        </div>

                        {meta?.y_label && (
                            <div className="chart-subtitle">
                                {meta.y_label.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <StackedBarChartWrapper data={plotData} meta={meta} />
                </div>
            )}

        </div>
    );
}