export const generateFakeInferenceHistory = () => {
  const locations = ['Prateleira A', 'Estoque Principal', 'Setor Frutas', 'Depósito B', 'Área de Venda'];

  const bananaImages = [
    {
      url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919',
      green: 0,
      ripe: 1,
      overripe: 0
    },
    {
      url: 'https://images.unsplash.com/photo-1566393028639-d108a42c46a7',
      green: 0,
      ripe: 3,
      overripe: 0
    },
    {
      url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
      green: 0,
      ripe: 5,
      overripe: 0
    },
    {
      url: 'https://image.tuasaude.com/media/article/lh/gp/beneficios-da-banana-verde_7527.jpg',
      green: 5,
      ripe: 0,
      overripe: 0
    },
    {
      url: 'https://www.dicasdemulher.com.br/wp-content/uploads/2018/03/qual-banana-consumir.jpg',
      green: 2,
      ripe: 2,
      overripe: 2
    }
  ];

  const generateResultsFromImageData = (imageData) => {
    const results = [];
    
    for (let i = 0; i < imageData.green; i++) {
      results.push({
        class_name: 'Banana',
        confidence: 0.7 + Math.random() * 0.3,
        bounding_box: [
          Math.random() * 0.3,
          Math.random() * 0.3,
          0.2 + Math.random() * 0.3,
          0.2 + Math.random() * 0.3
        ],
        maturation_level: {
          score: 0.1 + Math.random() * 0.3,
          category: 'green',
          estimated_days_until_spoilage: 5 + Math.floor(Math.random() * 5)
        }
      });
    }
    
    for (let i = 0; i < imageData.ripe; i++) {
      results.push({
        class_name: 'Banana',
        confidence: 0.7 + Math.random() * 0.3,
        bounding_box: [
          Math.random() * 0.3,
          Math.random() * 0.3,
          0.2 + Math.random() * 0.3,
          0.2 + Math.random() * 0.3
        ],
        maturation_level: {
          score: 0.4 + Math.random() * 0.3,
          category: 'ripe',
          estimated_days_until_spoilage: 1 + Math.floor(Math.random() * 3)
        }
      });
    }
    
    for (let i = 0; i < imageData.overripe; i++) {
      results.push({
        class_name: 'Banana',
        confidence: 0.7 + Math.random() * 0.3,
        bounding_box: [
          Math.random() * 0.3,
          Math.random() * 0.3,
          0.2 + Math.random() * 0.3,
          0.2 + Math.random() * 0.3
        ],
        maturation_level: {
          score: 0.7 + Math.random() * 0.3,
          category: 'overripe',
          estimated_days_until_spoilage: Math.floor(Math.random() * 2)
        }
      });
    }
    
    return results;
  };

  const generateImageUrl = (baseUrl, type = 'original') => {
    return type === 'result' 
      ? `${baseUrl}?w=800&h=600&fit=crop&q=80&overlay=1` 
      : `${baseUrl}?w=400&h=300&fit=crop&q=80`;
  };

  return Array.from({ length: 25 }, (_, index) => {
    const imageData = bananaImages[index % bananaImages.length];
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(index / 3));
    date.setHours(9 + Math.floor(Math.random() * 8));
    date.setMinutes(Math.floor(Math.random() * 60));

    const imageId = `img-${Date.now()}-${index}`;
    
    const results = generateResultsFromImageData(imageData);
    
    const greenCount = imageData.green;
    const ripeCount = imageData.ripe;
    const overripeCount = imageData.overripe;
    const totalObjects = greenCount + ripeCount + overripeCount;
    
    let averageMaturationScore = 0;
    if (totalObjects > 0) {
      averageMaturationScore = (ripeCount) / totalObjects;
    }
    
    let averageConfidence = 0;
    if (results.length > 0) {
      averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    }

    const imageUrl = generateImageUrl(imageData.url, 'original');
    const imageResultUrl = generateImageUrl(imageData.url, 'result');
    
    return {
      image_id: imageId,
      user_id: 'default-user',
      processing_timestamp: date.toISOString(),
      location: locations[Math.floor(Math.random() * locations.length)],
      status: 'completed',
      image_url: imageUrl,
      image_result_url: imageResultUrl,
      thumbnail_url: imageUrl,
      results: results,
      summary: {
        total_objects: totalObjects,
        average_maturation_score: averageMaturationScore,
        average_confidence: averageConfidence,
        total_processing_time_ms: 2000 + Math.floor(Math.random() * 3000),
        detection_time_ms: 1000 + Math.floor(Math.random() * 1500),
        maturation_analysis_time_ms: 800 + Math.floor(Math.random() * 1200),
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
          detection_time_ms: 1000 + Math.floor(Math.random() * 1500),
          objects_detected: totalObjects,
          average_confidence: averageConfidence
        },
        image_result_url: imageResultUrl
      },
      metadata: {
        source: Math.random() > 0.5 ? 'webcam' : 'monitoring',
        camera_settings: {
          resolution: '1920x1080',
          format: 'JPEG',
          quality: 85
        },
        environmental: {
          lighting_conditions: ['natural', 'artificial', 'mixed'][Math.floor(Math.random() * 3)],
          estimated_temperature: 20 + Math.floor(Math.random() * 15)
        }
      }
    };
  });
};

export const generateFakeRecentInference = () => {
  const history = generateFakeInferenceHistory();
  return history[0];
};