import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DollarSign, Tag, ShoppingBag, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  onSaleClick: () => void;
  onTransferClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const salesData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const productData = {
    labels: ['Laptop Pro X', 'Smartphone Ultra', 'Auriculares Premium', 'Tablet Pro'],
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: [65, 85, 45, 55],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const stats = [
    {
      title: 'Ventas Totales',

      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Producto más vendido',

      icon: Tag,
      color: 'bg-green-500',
    },
    {
      title: 'Productos Vendidos',
      icon: ShoppingBag,
      color: 'bg-purple-500',
    },
    {
      title: 'Ingresos',
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold mt-1"></p> {/*Aqui van los valores*/}
                </div>
                <div className={`${stat.color} p-3 rounded-full text-white`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-semibold">
                  {/*Aqui van las comparaciones*/}
                </span>
                <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Ventas Mensuales</h3>
          <div className="h-[300px] md:h-[400px]">
            <Line 
              data={salesData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }} 
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
          <div className="h-[300px] md:h-[400px]">
            <Bar 
              data={productData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};