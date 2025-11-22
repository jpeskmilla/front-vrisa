import React from "react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primario text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
