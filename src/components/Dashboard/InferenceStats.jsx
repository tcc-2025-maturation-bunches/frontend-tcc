import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Card from '../common/Card';
import Loader from '../common/Loader';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];
const MATURATION_CATEGORIES = {
  'green': { label: 'Verdes', color: '#22c55e' },
  'ripe': { label: 'Maduras', color: '#eab308' },
  'overripe': { label: 'Passadas', color: '#ef4444' }
};

const InferenceStats = ({ data, isLoading }) => {
  const maturationDistributionData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const counts = {
      green: 0,
      ripe: 0,
      overripe: 0
    };

    data.forEach(inference => {
      if (inference.results && Array.isArray(inference.results)) {
        inference.results.forEach(result => {
          if (result.maturation_level && result.maturation_level.category) {
            const category = result.maturation_level.category.toLowerCase();
            if (counts[category] !== undefined) {
              counts[category]++;
            }
          }
        });
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: MATURATION_CATEGORIES[name]?.label || name,
      value,
      color: MATURATION_CATEGORIES[name]?.color
    }));
  }, [data]);

  const maturationTrendData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data].sort((a, b) => 
      new Date(a.processing_timestamp) - new Date(b.processing_timestamp)
    );

    const groupedByDay = {};
    sortedData.forEach(inference => {
      const date = new Date(inference.processing_timestamp);
      const day = date.toISOString().split('T')[0];
      
      if (!groupedByDay[day]) {
        groupedByDay[day] = {
          date: day,
          green: 0,
          ripe: 0, 
          overripe: 0,
          total: 0
        };
      }

      if (inference.results && Array.isArray(inference.results)) {
        inference.results.forEach(result => {
          if (result.maturation_level && result.maturation_level.category) {
            const category = result.maturation_level.category.toLowerCase();
            if (groupedByDay[day][category] !== undefined) {
              groupedByDay[day][category]++;
              groupedByDay[day].total++;
            }
          }
        });
      }
    });

    return Object.values(groupedByDay);
  }, [data]);

  const countsByLocationData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const groupedByLocation = {};
    data.forEach(inference => {
      const location = inference.location || 'Desconhecido';
      
      if (!groupedByLocation[location]) {
        groupedByLocation[location] = {
          location,
          count: 0
        };
      }
      
      groupedByLocation[location].count++;
    });

    return Object.values(groupedByLocation);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-gray-900 dark:text-gray-200">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Estatísticas de Maturação"
      className="h-full"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader text="Carregando estatísticas..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de pizza para distribuição de maturação */}
          <div className="h-64">
            <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
              Distribuição de Maturação
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={maturationDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {maturationDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de linha para tendência de maturação */}
          <div className="h-64">
            <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
              Tendência de Maturação por Dia
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={maturationTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="green" stroke={MATURATION_CATEGORIES.green.color} name={MATURATION_CATEGORIES.green.label} />
                <Line type="monotone" dataKey="ripe" stroke={MATURATION_CATEGORIES.ripe.color} name={MATURATION_CATEGORIES.ripe.label} />
                <Line type="monotone" dataKey="overripe" stroke={MATURATION_CATEGORIES.overripe.color} name={MATURATION_CATEGORIES.overripe.label} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de barras para contagem de análises por local */}
          <div className="h-64 md:col-span-2">
            <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
              Análises por Local
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={countsByLocationData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Quantidade" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
};

export default InferenceStats;
