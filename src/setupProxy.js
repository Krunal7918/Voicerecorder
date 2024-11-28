const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('*', {
            target: 'http://localhost:8080',  // Adjust this if you're running on a different port
            changeOrigin: true,
            onProxyRes(proxyRes, req, res) {
                proxyRes.headers['Cross-Origin-Opener-Policy'] = 'same-origin';
                proxyRes.headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
            },
        })
    );
};
