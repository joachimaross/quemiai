export const prometheusConfig = {
  defaultMetrics: {
    enabled: true,
  },
  defaultLabels: {
    app: 'quemiai',
    environment: process.env.NODE_ENV || 'development',
  },
};
