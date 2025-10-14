import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../common/Card';
import Loader from '../common/Loader';

const COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
const MATURATION_CATEGORIES = {
    'verde': { label: 'Verdes', color: '#22c55e' },
    'quase_madura': { label: 'Quase Maduras', color: '#84cc16' },
    'madura': { label: 'Maduras', color: '#eab308' },
    'muito_madura': { label: 'Muito Maduras', color: '#f97316' },
    'passada': { label: 'Passadas', color: '#ef4444' }
};

const InferenceStatsPreview = ({ data, isLoading, onViewDetails }) => {
    const maturationDistributionData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const counts = {
            verde: 0,
            quase_madura: 0,
            madura: 0,
            muito_madura: 0,
            passada: 0
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

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
                    <p className="text-gray-900 dark:text-gray-200 font-medium">
                        {data.name}
                    </p>
                    <p style={{ color: data.color || data.fill }}>
                        Quantidade: {data.value}
                    </p>
                </div>
            );
        }
        return null;
    };

    const hasData = maturationDistributionData.length > 0 && maturationDistributionData.some(item => item.value > 0);

    return (
        <div className="h-full">
            <Card
                title="Distribuição de Maturação"
                className="h-full flex flex-col"
                key={`stats-preview-${data?.length || 0}`}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader text="Carregando estatísticas..." />
                    </div>
                ) : hasData ? (
                    <>
                        <div className="h-64 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart key={`pie-preview-${maturationDistributionData.length}`}>
                                    <Pie
                                        data={maturationDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {maturationDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${entry.name}-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <div className="h-16 w-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Estatísticas Detalhadas
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Visualize gráficos e análises completas dos dados
                                </p>
                                <button
                                    onClick={onViewDetails}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150"
                                >
                                    Ver Estatísticas
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-6">
                            <div className="h-16 w-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Estatísticas Detalhadas
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Visualize gráficos e análises completas dos dados
                            </p>
                            <button
                                onClick={onViewDetails}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150"
                            >
                                Ver Estatísticas
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default InferenceStatsPreview;