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
      if (inference.summary?.maturation_counts) {
        counts.green += inference.summary.maturation_counts.green || 0;
        counts.ripe += inference.summary.maturation_counts.ripe || 0;
        counts.overripe += inference.summary.maturation_counts.overripe || 0;
      } else if (inference.results && Array.isArray(inference.results)) {
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
      const formattedDay = new Date(day).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });

      if (!groupedByDay[formattedDay]) {
        groupedByDay[formattedDay] = {
          date: formattedDay,
          green: 0,
          ripe: 0,
          overripe: 0,
          total: 0
        };
      }

      if (inference.summary?.maturation_counts) {
        groupedByDay[formattedDay].green += inference.summary.maturation_counts.green || 0;
        groupedByDay[formattedDay].ripe += inference.summary.maturation_counts.ripe || 0;
        groupedByDay[formattedDay].overripe += inference.summary.maturation_counts.overripe || 0;
        groupedByDay[formattedDay].total += 
          (inference.summary.maturation_counts.green || 0) +
          (inference.summary.maturation_counts.ripe || 0) +
          (inference.summary.maturation_counts.overripe || 0);
      } else if (inference.results && Array.isArray(inference.results)) {
        inference.results.forEach(result => {
          if (result.maturation_level && result.maturation_level.category) {
            const category = result.maturation_level.category.toLowerCase();
            if (groupedByDay[formattedDay][category] !== undefined) {
              groupedByDay[formattedDay][category]++;
              groupedByDay[formattedDay].total++;
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
          count: 0,
          green: 0,
          ripe: 0,
          overripe: 0
        };
      }

      groupedByLocation[location].count++;

      if (inference.summary?.maturation_counts) {
        groupedByLocation[location].green += inference.summary.maturation_counts.green || 0;
        groupedByLocation[location].ripe += inference.summary.maturation_counts.ripe || 0;
        groupedByLocation[location].overripe += inference.summary.maturation_counts.overripe || 0;
      }
    });

    return Object.values(groupedByLocation).sort((a, b) => b.count - a.count);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-gray-900 dark:text-gray-200 font-medium mb-2">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
          {payload.length > 1 && (
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
              Total: {payload.reduce((sum, entry) => sum + entry.value, 0)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = payload[0].payload?.payload?.totalValue || 0;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-gray-900 dark:text-gray-200 font-medium">
            {data.name}
          </p>
          <p style={{ color: data.color || data.fill }} className="text-sm font-semibold">
            Quantidade: {data.value}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            {percentage}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-gray-900 dark:text-gray-200 font-medium mb-2">
            Local: {label}
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
            Análises: {payload[0]?.value || 0}
          </p>
          {payload[0]?.payload?.green !== undefined && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
              <p className="text-xs" style={{ color: MATURATION_CATEGORIES.green.color }}>
                Verdes: {payload[0].payload.green}
              </p>
              <p className="text-xs" style={{ color: MATURATION_CATEGORIES.ripe.color }}>
                Maduras: {payload[0].payload.ripe}
              </p>
              <p className="text-xs" style={{ color: MATURATION_CATEGORIES.overripe.color }}>
                Passadas: {payload[0].payload.overripe}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const totalValue = useMemo(() => {
    return maturationDistributionData.reduce((sum, item) => sum + item.value, 0);
  }, [maturationDistributionData]);

  const enrichedPieData = useMemo(() => {
    return maturationDistributionData.map(item => ({
      ...item,
      totalValue
    }));
  }, [maturationDistributionData, totalValue]);

  return (
    <Card
      title="Estatísticas de Maturação"
      subtitle={`Análise de ${data?.length || 0} inspeções com ${totalValue} objetos detectados`}
      className="h-full"
      key={`stats-${data?.length || 0}`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader text="Carregando estatísticas..." />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80" key="pie-chart">
            <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
              Distribuição de Maturação (Total de Objetos)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart key={`pie-${enrichedPieData.length}`}>
                <Pie
                  data={enrichedPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {enrichedPieData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-80" key="line-chart">
            <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
              Tendência de Maturação ao Longo do Tempo
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                key={`line-${maturationTrendData.length}`}
                data={maturationTrendData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 14 }} />
                <Line 
                  type="monotone" 
                  dataKey="green" 
                  stroke={MATURATION_CATEGORIES.green.color} 
                  name={MATURATION_CATEGORIES.green.label}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ripe" 
                  stroke={MATURATION_CATEGORIES.ripe.color} 
                  name={MATURATION_CATEGORIES.ripe.label}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="overripe" 
                  stroke={MATURATION_CATEGORIES.overripe.color} 
                  name={MATURATION_CATEGORIES.overripe.label}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-80 md:col-span-2" key="bar-chart">
            <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
              Análises por Local
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                key={`bar-${countsByLocationData.length}`}
                data={countsByLocationData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="location"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<BarTooltip />} />
                <Legend wrapperStyle={{ fontSize: 14 }} />
                <Bar dataKey="count" name="Total de Análises" fill="#4ade80" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
            Nenhum dado disponível para análise
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Realize análises de imagens para visualizar estatísticas
          </p>
        </div>
      )}
    </Card>
  );
}

export default InferenceStats;
