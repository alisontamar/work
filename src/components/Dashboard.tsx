import React, { useEffect, useState } from 'react';
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
import { supabase } from '../lib/supabase'; // Asegúrate de tener configurado esto

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
  const [monthlySales, setMonthlySales] = useState<number[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; total: number }[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [monthLabels, setMonthLabels] = useState<string[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      // Ventas mensuales (usa una función RPC si la tienes)
      const { data: ventasMes, error: errorVentas } = await supabase.rpc('ventas_por_mes');
      if (ventasMes) {
  const values = ventasMes.map((row: any) => parseFloat(row.total));
  const labels = ventasMes.map((row: any) => row.mes); // <- aquí usamos los nombres como 'Ene', 'Feb', etc.
  setMonthlySales(values);
  setMonthLabels(labels);
}


      // Productos más vendidos
      const { data: productItems, error: errorProductos } = await supabase
        .from('sale_items')
        .select('quantity, product_id, products(name)')
        .limit(1000);

      if (productItems) {
        const countMap: { [name: string]: number } = {};
        let total = 0;

        productItems.forEach((item: any) => {
          const name = item.products?.name || 'Desconocido';
          countMap[name] = (countMap[name] || 0) + item.quantity;
          total += item.quantity;
        });

        const sorted = Object.entries(countMap)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total);

        setTopProducts(sorted.slice(0, 5));
        setTotalUnits(total);
      }

      // Total de ventas (ingresos)
      const { data: ventasTotales } = await supabase
        .from('sales')
        .select('total_amount', { count: 'exact' });

      if (ventasTotales) {
        const suma = ventasTotales.reduce((acc: number, row: any) => acc + parseFloat(row.total_amount), 0);
        setTotalSales(suma);
      }
    };

    fetchData();
  }, []);

const salesData = {
  labels: monthLabels, // ← aquí cambiamos las etiquetas estáticas
  datasets: [
    {
      label: 'Ventas Mensuales',
      data: monthlySales,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    },
  ],
};

  const productData = {
    labels: topProducts.map((p) => p.name),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: topProducts.map((p) => p.total),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const stats = [
    {
      title: 'Ventas Totales',
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Producto más vendido',
      value: topProducts[0]?.name || 'N/A',
      icon: Tag,
      color: 'bg-green-500',
    },
    {
      title: 'Productos Vendidos',
      value: totalUnits.toString(),
      icon: ShoppingBag,
      color: 'bg-purple-500',
    },
    {
      title: 'Ingresos',
      value: `$${totalSales.toFixed(2)}`,
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
                  <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full text-white`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-semibold">
                  {/* Comparación opcional */}
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
                  },
                },
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
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
