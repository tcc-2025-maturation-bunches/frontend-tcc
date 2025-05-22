export const generateFakeInferenceHistory = () => {
  const fruits = ['Banana', 'Maçã', 'Laranja', 'Manga', 'Pêra'];
  const locations = ['Prateleira A', 'Estoque Principal', 'Setor Frutas', 'Depósito B', 'Área de Venda'];
  const categories = ['green', 'ripe', 'overripe'];
  const categoryLabels = { green: 'Verde', ripe: 'Maduro', overripe: 'Passado' };

  const generateResults = (count) => {
    return Array.from({ length: count }, (_, index) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      return {
        class_name: fruits[Math.floor(Math.random() * fruits.length)],
        confidence: 0.7 + Math.random() * 0.3,
        bounding_box: [
          Math.random() * 0.3,
          Math.random() * 0.3,
          0.2 + Math.random() * 0.3,
          0.2 + Math.random() * 0.3
        ],
        maturation_level: {
          score: Math.random(),
          category: category,
          estimated_days_until_spoilage: category === 'green' ? 5 + Math.floor(Math.random() * 5) : 
                                        category === 'ripe' ? 1 + Math.floor(Math.random() * 3) : 
                                        Math.floor(Math.random() * 2)
        }
      };
    });
  };

  const generateImageUrl = (id, type = 'original') => {
    const baseUrl = 'https://picsum.photos';
    const imageId = 100 + (parseInt(id.slice(-3)) % 900);
    return type === 'result' 
      ? `${baseUrl}/800/600?random=${imageId}&blur=1` 
      : `${baseUrl}/800/600?random=${imageId}`;
  };

  return Array.from({ length: 15 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    date.setHours(9 + Math.floor(Math.random() * 8));
    date.setMinutes(Math.floor(Math.random() * 60));

    const imageId = `img-${Date.now()}-${index}`;
    const totalObjects = 3 + Math.floor(Math.random() * 8);
    const results = generateResults(totalObjects);
    
    const greenCount = results.filter(r => r.maturation_level.category === 'green').length;
    const ripeCount = results.filter(r => r.maturation_level.category === 'ripe').length;
    const overripeCount = results.filter(r => r.maturation_level.category === 'overripe').length;
    
    const averageMaturationScore = results.reduce((sum, r) => sum + r.maturation_level.score, 0) / results.length;

    return {
      image_id: imageId,
      user_id: 'default-user',
      processing_timestamp: date.toISOString(),
      location: locations[Math.floor(Math.random() * locations.length)],
      status: 'completed',
      image_url: generateImageUrl(imageId, 'original'),
      image_result_url: generateImageUrl(imageId, 'result'),
      results: results,
      summary: {
        total_objects: totalObjects,
        average_maturation_score: averageMaturationScore,
        total_processing_time_ms: 2000 + Math.floor(Math.random() * 3000),
        detection_time_ms: 1000 + Math.floor(Math.random() * 1500),
        maturation_counts: {
          green: greenCount,
          ripe: ripeCount,
          overripe: overripeCount
        }
      },
      detection: {
        request_id: `det-${imageId}`,
        status: 'success',
        processing_timestamp: date.toISOString(),
        summary: {
          detection_time_ms: 1000 + Math.floor(Math.random() * 1500)
        },
        image_result_url: generateImageUrl(imageId, 'result')
      }
    };
  });
};

export const generateFakeRecentInference = () => {
  const history = generateFakeInferenceHistory();
  return history[0];
};