import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Loader from '../common/Loader';
import Button from '../common/Button';
import useWebcamCapture from '../../hooks/useWebcamCapture';
import useInferencePoller from '../../hooks/useInferencePoller';
import { processImageCombined } from '../../api/inferenceApi';

const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  let os = 'Unknown';
  if (/Windows NT/i.test(userAgent)) os = 'Windows';
  else if (/Mac OS X/i.test(userAgent)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/Linux/i.test(userAgent)) os = 'Linux';
  
  let browser = 'Unknown';
  if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) browser = 'Chrome';
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
  else if (/Edge|Edg/i.test(userAgent)) browser = 'Edge';
  else if (/Opera|OPR/i.test(userAgent)) browser = 'Opera';
  
  let captureMethod = 'webcam';
  if (isMobile) {
    captureMethod = 'mobile_camera';
  } else if (isTablet) {
    captureMethod = 'tablet_camera';
  }
  
  const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  return {
    device_type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    os: os,
    browser: browser,
    capture_method: captureMethod,
    has_camera_support: hasCamera,
    screen_resolution: `${screen.width}x${screen.height}`,
    user_agent: userAgent
  };
};

const WebcamCaptureModal = ({ onClose, onInferenceCreated, userId }) => {
  const [step, setStep] = useState(1); // 1: permission, 2: captura, 3: Resultado
  const [location, setLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  
  const {
    webcamRef,
    isPermissionGranted,
    isCameraLoading,
    capturedImage,
    isUploading,
    uploadError,
    uploadedImageUrl,
    uploadedImageId,
    requestCameraAccess,
    captureImage,
    resetImage,
    uploadImage
  } = useWebcamCapture();

  const [requestId, setRequestId] = useState(null);
  const {
    status,
    result,
    error,
    isPolling,
    startPolling,
    stopPolling
  } = useInferencePoller(requestId);

  useEffect(() => {
    requestCameraAccess();
  }, []);

  useEffect(() => {
    if (requestId) {
      startPolling();
    }
    
    return () => {
      if (isPolling) {
        stopPolling();
      }
    };
  }, [requestId]);

  useEffect(() => {
    if (status?.status === 'completed' && result && step !== 3) {
      setIsProcessing(false);
      setStep(3);
      onInferenceCreated(result);
    } else if (status?.status === 'error' || status?.status === 'failed') {
      setIsProcessing(false);
      setProcessingError(status.error_message || 'Erro no processamento');
    } else if (error) {
      setIsProcessing(false);
      setProcessingError(error);
    }
  }, [status, result, error, step]);


  const handleCaptureClick = useCallback(async () => {
    const captured = captureImage();
    if (captured) {
      setStep(2);
      setProcessingError(null);
    } else {
      console.error('Erro ao capturar imagem');
    }
  }, [captureImage]);

  const handleProcessClick = useCallback(async () => {
    try {
      setIsProcessing(true);
      setProcessingError(null);
      setRequestId(null);
      
      const uploadResult = await uploadImage(userId);
      
      if (!uploadResult) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const deviceInfo = getDeviceInfo();
      
      const metadata = {
        user_id: userId,
        image_id: uploadResult.imageId,
        location: location || 'Webcam',
        source: deviceInfo.capture_method,
        timestamp: new Date().toISOString(),
        device_info: deviceInfo,
      };
      
      const processResult = await processImageCombined(uploadResult.imageUrl, metadata);
      
      if (!processResult?.request_id) {
        throw new Error('Request ID não retornado pelo servidor');
      }
      
      setRequestId(processResult.request_id);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setProcessingError(error.message || 'Erro desconhecido ao processar imagem');
      setIsProcessing(false);
      setRequestId(null);
    }
  }, [userId, uploadImage, location]);

  const handleTryAgain = () => {
    if (isPolling) {
      stopPolling();
    }
    onClose();
    setTimeout(() => {
      if (onInferenceCreated) {
        onInferenceCreated({ action: 'reopen_modal' });
      }
    }, 100);
  };

  const getProgressMessage = () => {
    if (!status) return "Iniciando processamento...";
    
    const progress = status.progress || 0;
    if (progress < 0.3) return "Preparando análise...";
    if (progress < 0.5) return "Detectando objetos...";
    if (progress < 0.8) return "Analisando maturação...";
    if (progress < 1) return "Finalizando...";
    return "Processamento concluído!";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {step === 1 ? 'Capturar Imagem' : step === 2 ? 'Confirmar Imagem' : 'Resultado da Análise'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isProcessing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              {isCameraLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader text="Aguardando acesso à câmera..." />
                </div>
              ) : isPermissionGranted ? (
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Posicione a fruta no centro da imagem e clique em "Capturar".
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    É necessário permitir o acesso à câmera para continuar.
                  </p>
                  <Button variant="primary" onClick={requestCameraAccess}>
                    Permitir acesso à câmera
                  </Button>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Estoque, Prateleira A, etc."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Campo obrigatório para identificar a origem da análise
                </p>
              </div>

              <div className="flex justify-end mt-4">
                <Button 
                  variant="secondary" 
                  onClick={onClose} 
                  className="mr-3"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleCaptureClick}
                  disabled={!isPermissionGranted || isCameraLoading}
                >
                  Capturar
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {capturedImage && (
                    <img 
                      src={capturedImage} 
                      alt="Imagem capturada" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Verifique se a imagem está boa para análise.
                </p>
              </div>

              {isUploading || isProcessing ? (
                <div className="mt-4">
                  <div className="flex justify-center mb-2">
                    <Loader text={isUploading ? "Enviando imagem..." : getProgressMessage()} />
                  </div>
                  {status?.progress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${(status.progress * 100).toFixed(0)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ) : (uploadError || processingError) ? (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                  <p className="font-medium">Erro:</p>
                  <p className="text-sm">{uploadError || processingError}</p>
                </div>
              ) : (
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={handleTryAgain}
                    className="mr-3"
                  >
                    Tentar novamente
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleProcessClick}
                    disabled={!location.trim()}
                  >
                    Processar imagem
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Imagem Processada</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {result.image_result_url ? (
                      <img
                        src={result.image_result_url}
                        alt="Resultado da análise"
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <div className="flex justify-center items-center h-48 text-gray-500 dark:text-gray-400">
                        <p>Imagem não disponível</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Resultados</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-500 dark:text-gray-400">Total de objetos:</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">
                          {result.summary?.total_objects || 0}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500 dark:text-gray-400">Com análise de maturação:</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">
                          {result.summary?.objects_with_maturation || 0}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500 dark:text-gray-400">Maturação média:</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">
                          {result.summary?.average_maturation_score 
                            ? `${(result.summary.average_maturation_score * 100).toFixed(1)}%` 
                            : 'N/A'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500 dark:text-gray-400">Tempo de processamento:</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">
                          {result.summary?.total_processing_time_ms 
                            ? `${(result.summary.total_processing_time_ms / 1000).toFixed(2)}s` 
                            : 'N/A'}
                        </dd>
                      </div>
                    </dl>

                    {result.summary?.maturation_counts && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distribuição:</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Verdes</span>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {result.summary.maturation_counts.green || 0}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Maduras</span>
                            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                              {result.summary.maturation_counts.ripe || 0}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mb-1"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Passadas</span>
                            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                              {result.summary.maturation_counts.overripe || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button 
                  variant="secondary" 
                  onClick={handleTryAgain}
                  className="mr-3"
                >
                  Nova Captura
                </Button>
                <Button 
                  variant="primary" 
                  onClick={onClose}
                >
                  Concluir
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WebcamCaptureModal;