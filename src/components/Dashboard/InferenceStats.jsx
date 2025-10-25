import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Card from '../common/Card';
import Loader from '../common/Loader';

const MATURATION_CATEGORIES = {
  'Verdes': { label: 'Verde(s)', color: '#22c55e' },
  'Quase Maduros': { label: 'Quase Maduro(s)', color: '#84cc16' },
  'Maduros': { label: 'Maduro(s)', color: '#eab308' },
  'Muito Maduros/Passados': { label: 'Muito Maduro(s)/Passado(s)', color: '#ef4444' },
};

const InferenceStats = ({ statsApiData, isLoading }) => {

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
               {barData.verde > 0 && <p className="text-xs" style={{ color: MATURATION_CATEGORIES.Verdes.color }}>Verdes: {barData.verde}</p>}
               {barData.quase_maduro > 0 && <p className="text-xs" style={{ color: MATURATION_CATEGORIES['Quase Maduros'].color }}>Quase Maduros: {barData.quase_maduro}</p>}
               {barData.maduro > 0 && <p className="text-xs" style={{ color: MATURATION_CATEGORIES.Maduros.color }}>Maduros: {barData.maduro}</p>}
               {barData.muito_maduro_ou_passado > 0 && <p className="text-xs" style={{ color: MATURATION_CATEGORIES['Muito Maduros/Passados'].color }}>Muito Maduros/Passados: {barData.muito_maduro_ou_passado}</p>}
             </div>
          )}
        </div>
      );
    }
    return null;
  };

  const maturationDistributionData = statsApiData?.maturation_distribution || [];
  const maturationTrendData = statsApiData?.maturation_trend || [];
  const countsByLocationData = statsApiData?.counts_by_location || [];
  const totalObjects = statsApiData?.total_objects_detected || 0;
  const totalInspections = statsApiData?.total_inspections || 0;

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
      ) : statsApiData && (maturationDistributionData.length > 0 || maturationTrendData.length > 0 || countsByLocationData.length > 0) ? (
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
                       <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
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
                  <Line type="linear" dataKey="verde" stroke={MATURATION_CATEGORIES.Verdes.color} name={MATURATION_CATEGORIES.Verdes.label} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="linear" dataKey="quase_maduro" stroke={MATURATION_CATEGORIES['Quase Maduros'].color} name={MATURATION_CATEGORIES['Quase Maduros'].label} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="linear" dataKey="maduro" stroke={MATURATION_CATEGORIES.Maduros.color} name={MATURATION_CATEGORIES.Maduros.label} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="linear" dataKey="muito_maduro_ou_passado" stroke={MATURATION_CATEGORIES['Muito Maduros/Passados'].color} name={MATURATION_CATEGORIES['Muito Maduros/Passados'].label} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}


          {countsByLocationData.length > 0 && (
            <div className="h-80 md:col-span-2" key="bar-chart">
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
            Verifique se há análises realizadas no período selecionado.
          </p>
        </div>
      )}
    </Card>
  );
}

export default InferenceStats;