import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  const data = [
    { name: "Feb 12", value: 0 }, // Lowest
    { name: "Feb 13", value: 0 }, // Still at the lowest
    { name: "Feb 14", value: 1 }, // First peak (lower)
    { name: "Feb 15", value: 0.5 }, // Slight dip
    { name: "Feb 16", value: 2 }, // Second peak (higher)
    { name: "Feb 17", value: 0 }, // Drops to lowest
  ];
  
  export const DLineChart = () => (
    <div className="bg-white w-3/5 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
          <select className="border rounded-md p-2 w-60 text-sm">
            <option>Web Engagement</option>
          </select>
        </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 30 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} /> {/* Solid grid lines */}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            padding={{ left: 15, right: 15 }} // Adds space on X-axis
            tickMargin={10} // Adds space between X-axis labels and graph
          />
          <YAxis
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickMargin={12} // Adds space between Y-axis labels and graph
          />
          <Tooltip />
          <Line type="linear" dataKey="value" stroke="#23388F" strokeWidth={2} dot={false} /> 
          {/* Removed dots, made it solid */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  
  export default DLineChart;
  