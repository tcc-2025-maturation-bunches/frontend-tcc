import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';
import Card from '../common/Card';
import Loader from '../common/Loader';

const MATURATION_CATEGORIES = {
  'verde': { label: 'Verde(s)', color: '#22c55e', displayName: 'Verdes' },
  'quase_maduro': { label: 'Quase Maduro(s)', color: '#84cc16', displayName: 'Quase Maduros' },
  'maduro': { label: 'Maduro(s)', color: '#eab308', displayName: 'Maduros' },
  'muito_maduro_ou_passado': { label: 'Muito Maduro(s)/Passado(s)', color: '#ef4444', displayName: 'Muito Maduros/Passados' },
};

const InferenceStats = ({ statsApiData, isLoading }) => {
  const [selectedLocation, setSelectedLocation] = useState('');

  const normalizeMaturationDistribution = (data) => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const categoryKey = item.key;
      const category = MATURATION_CATEGORIES[categoryKey];
      
      if (!category) {
        console.warn(`Categoria de maturação desconhecida: ${categoryKey}`);
        return null;
      }
      
      return {
        key: categoryKey,
        name: category.displayName,
        value: item.value,
        color: category.color
      };
    }).filter(item => item !== null);
  };

   const CustomTooltip = ({ active, payload, label }) => {
     if (active && payload && payload.length) {
       const dataPoint = payload[0]?.payload;
       const total = dataPoint?.total || 0;

       return (
         <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
           <p className="text-gray-900 dark:text-gray-200 font-medium mb-2">{`${label}`}</p>
           {payload.map((entry, index) => (
             <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
               {`${MATURATION_CATEGORIES[entry.name]?.label || entry.name}: ${entry.value}`}
             </p>
           ))}
           {total > 0 && (
             <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
               Total Objetos: {total}
             </p>
           )}
         </div>
       );
     }
     return null;
   };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = statsApiData?.total_objects_detected || 0;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-gray-900 dark:text-gray-200 font-medium">
            {data.name}
          </p>
          <p style={{ color: data.color }} className="text-sm font-semibold">
            Quantidade: {data.value}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            {percentage}% do total de objetos
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const barData = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-gray-900 dark:text-gray-200 font-medium mb-2">
            Local: {label}
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
            Inspeções: {barData?.count || 0}
          </p>
          {(barData?.verde !== undefined || barData?.maduro !== undefined) && (
             <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
               {barData.verde > 0 && <p className="text-xs" style={{ color: MATURATION_CATEGORIES.verde.color }}>Verdes: {barData.verde}</p>}
               {barData.quase_maduro > 0 && <p className="text-xs" style={{ color: MATURATION_CATEGORIES.quase_maduro.color }}>Quase Maduros: {barData.quase_maduro}</p>}
               {barData.maduro > 0 && <p className="text-xs" style={{ color: MATURATION_CATEGORIES.maduro.color }}>Maduros: {barData.maduro}</p>}
               {barData.muito_maduro_ou_passado > 0 && <p className="text-xs" style={{ color: MATURATION_CATEGORIES.muito_maduro_ou_passado.color }}>Muito Maduros/Passados: {barData.muito_maduro_ou_passado}</p>}
             </div>
          )}
        </div>
      );
    }
    return null;
  };

  const LocationTrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      const total = dataPoint?.total || 0;

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-gray-900 dark:text-gray-200 font-medium mb-2">{`Data: ${label}`}</p>
          {payload.map((entry, index) => {
            const categoryKey = entry.dataKey;
            const category = MATURATION_CATEGORIES[categoryKey];
            return (
              <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
                {`${category?.label || entry.name}: ${entry.value}`}
              </p>
            );
          })}
          {total > 0 && (
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
              Total: {total} objetos
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const maturationDistributionData = normalizeMaturationDistribution(statsApiData?.maturation_distribution);
  const maturationTrendData = statsApiData?.maturation_trend || [];
  const countsByLocationData = statsApiData?.counts_by_location || [];
  const totalObjects = statsApiData?.total_objects_detected || 0;
  const totalInspections = statsApiData?.total_inspections || 0;
  const locationsWithTrend = countsByLocationData.filter(loc => loc.daily_trend && loc.daily_trend.length > 0);
  
  useEffect(() => {
    if (!selectedLocation && locationsWithTrend.length > 0) {
      setSelectedLocation(locationsWithTrend[0].location);
    }
  }, [locationsWithTrend, selectedLocation]);

  const selectedLocationData = countsByLocationData.find(loc => loc.location === selectedLocation);

  return (
    <Card
      title="Estatísticas de Maturação"
      subtitle={`Análise de ${totalInspections} inspeções com ${totalObjects} objetos detectados nos últimos ${statsApiData?.period_days || '?'} dias`}
      className="h-full"
      key={`stats-${totalInspections}-${totalObjects}`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader text="Carregando estatísticas..." />
        </div>
      ) : statsApiData && (totalObjects > 0 || totalInspections > 0 || maturationDistributionData.length > 0 || maturationTrendData.length > 0 || countsByLocationData.length > 0) ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {maturationDistributionData.map((item) => {
              const percentage = totalObjects > 0 ? ((item.value / totalObjects) * 100).toFixed(1) : 0;
              return (
                <div key={item.key} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage}% do total</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {maturationDistributionData.length > 0 && totalObjects > 0 && (
               <div className="h-80" key="pie-chart">
                <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Distribuição de Maturação (Total de Objetos)
                </h3>
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart key={`pie-${maturationDistributionData.length}`}>
                     <Pie
                       data={maturationDistributionData}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       outerRadius={90}
                       fill="#8884d8"
                       dataKey="value"
                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                     >
                       {maturationDistributionData.map((entry, index) => (
                         <Cell key={`cell-${entry.key}-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip content={<PieTooltip />} />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            )}

            {maturationTrendData.length > 0 && (
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
                    <Line type="linear" dataKey="verde" stroke={MATURATION_CATEGORIES.verde.color} name={MATURATION_CATEGORIES.verde.label} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="linear" dataKey="quase_maduro" stroke={MATURATION_CATEGORIES.quase_maduro.color} name={MATURATION_CATEGORIES.quase_maduro.label} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="linear" dataKey="maduro" stroke={MATURATION_CATEGORIES.maduro.color} name={MATURATION_CATEGORIES.maduro.label} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="linear" dataKey="muito_maduro_ou_passado" stroke={MATURATION_CATEGORIES.muito_maduro_ou_passado.color} name={MATURATION_CATEGORIES.muito_maduro_ou_passado.label} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {countsByLocationData.length > 0 && (
            <div className="h-80" key="bar-chart">
              <br></br>
              <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                Inspeções por Local
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
                  <Bar dataKey="count" name="Total de Inspeções" fill="#4ade80" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {locationsWithTrend.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Tendência Diária por Local
                </h3>
                <div className="flex items-center gap-3 relative z-10">
                  <label htmlFor="location-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Selecione o Local:
                  </label>
                  <select
                    id="location-select"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-[200px]"
                  >
                    {locationsWithTrend.map((location) => (
                      <option key={location.location} value={location.location}>
                        {location.location} ({location.count} inspeções)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedLocationData && selectedLocationData.daily_trend && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total de Inspeções</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedLocationData.count}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Verdes</p>
                      <p className="text-xl font-bold" style={{ color: MATURATION_CATEGORIES.verde.color }}>
                        {selectedLocationData.verde || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quase Maduros</p>
                      <p className="text-xl font-bold" style={{ color: MATURATION_CATEGORIES.quase_maduro.color }}>
                        {selectedLocationData.quase_maduro || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Maduros</p>
                      <p className="text-xl font-bold" style={{ color: MATURATION_CATEGORIES.maduro.color }}>
                        {selectedLocationData.maduro || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Muito Maduros</p>
                      <p className="text-xl font-bold" style={{ color: MATURATION_CATEGORIES.muito_maduro_ou_passado.color }}>
                        {selectedLocationData.muito_maduro_ou_passado || 0}
                      </p>
                    </div>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={selectedLocationData.daily_trend}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<LocationTrendTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="linear" dataKey="verde" stroke={MATURATION_CATEGORIES.verde.color} name={MATURATION_CATEGORIES.verde.label} strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="linear" dataKey="quase_maduro" stroke={MATURATION_CATEGORIES.quase_maduro.color} name={MATURATION_CATEGORIES.quase_maduro.label} strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="linear" dataKey="maduro" stroke={MATURATION_CATEGORIES.maduro.color} name={MATURATION_CATEGORIES.maduro.label} strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="linear" dataKey="muito_maduro_ou_passado" stroke={MATURATION_CATEGORIES.muito_maduro_ou_passado.color} name={MATURATION_CATEGORIES.muito_maduro_ou_passado.label} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
            Nenhum dado de estatística disponível
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {statsApiData ? 
              `Nenhuma inspeção realizada nos últimos ${statsApiData.period_days || '?'} dias.` :
              'Verifique se há análises realizadas no período selecionado.'}
          </p>
        </div>
      )}
    </Card>
  );
}

export default InferenceStats;