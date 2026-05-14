import axios from 'axios';

/**
 * Instância configurada do Axios para comunicação com o backend
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://lucast.app/api',
  timeout: 60000, // 60 segundos de timeout (Render pode demorar ao acordar)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição
 * Adiciona o token de autenticação automaticamente em todas as requisições
 */
api.interceptors.request.use(
  (config) => {
    // Verifica se estamos no cliente (browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de resposta
 * Trata erros globais e renova tokens quando necessário
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            const response = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            // Atualizar o header da requisição original
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Se falhar ao renovar, limpar tokens e redirecionar para login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
