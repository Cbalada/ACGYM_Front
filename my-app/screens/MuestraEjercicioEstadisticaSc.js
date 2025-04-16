import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { API_CONFIG } from '../constants/config';
import { LineChart } from 'react-native-chart-kit';
import { useMemo } from 'react';
import { ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const MuestraEjercicioEstadisticaSc = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, nombre, imageUrl } = route.params;
  const [imageError, setImageError] = useState(false);
  const [estadisticas, setEstadisticas] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  // Si chartData está definido y tiene labels, usa su longitud, si no, usa 0.
  const chartWidth =
    chartData && chartData.labels ? chartData.labels.length * 60 : screenWidth;

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/estadistica/ejercicio/${id}`);
        if (!response.ok) throw new Error('Error al obtener estadísticas');
        let data = await response.json();
        data.sort((a, b) => parseFecha(a.fecha) - parseFecha(b.fecha));
        setEstadisticas(data);
      } catch (error) {
        console.error('Error en fetchEstadisticas:', error);
      }
    };

    fetchEstadisticas();
  }, [id]);

  const parseFecha = (fechaStr) => {
    const [dia, mes, anio] = fechaStr.split('/').map(Number);
    return new Date(anio, mes - 1, dia);
  };

  const chartData = useMemo(() => ({
    labels: estadisticas.map((item) => item.fecha),
    datasets: [
      {
        data: estadisticas.map((item) => {
          const kilo = parseFloat(item.kilo);
          return isNaN(kilo) ? 0 : kilo;
        }),
      },
    ],
  }), [estadisticas]);

  console.log(chartData.datasets)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Ejercicio</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {!imageError && imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={styles.imageErrorText}>Imagen no disponible</Text>
          )}
          <Text style={styles.exerciseName}>{nombre}</Text>
        </View>

        {estadisticas.length > 0 ? (
          <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Progreso de Kilos</Text>
          {chartData && chartData.labels && chartData.datasets && (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                width={chartData.labels.length * 120}
                height={220}
                yAxisSuffix=" kg"
                fromZero={true}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 12,
                  },
                  propsForDots: {
                    r: '3',
                    strokeWidth: '2',
                    stroke: '#2196F3',
                  },
                }}
                bezier
                style={{ borderRadius: 16 }}
              />
            </ScrollView>
          )}

        </View>
        ) : (
          <Text style={styles.noDataText}>No hay estadísticas disponibles.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  card: {
    marginTop: 20,
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageErrorText: {
    fontStyle: 'italic',
    color: '#999',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    marginTop: 20,
    width: '90%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  noDataText: {
    marginTop: 30,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6200ea',
    padding: 15,
  },
  
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1, // Ocupa todo el espacio disponible en el centro
    textAlign: 'center', // Alinea el texto en el centro
  },
});

export default MuestraEjercicioEstadisticaSc;
