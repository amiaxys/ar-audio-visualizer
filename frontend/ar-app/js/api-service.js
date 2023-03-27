let apiService = (function () {
  let module = {};

  module.getVisualization = function (id) {
    return fetch(`${environment.BACKEND_URL}/api/visualizations/${id}`).then(
      (res) => res.json()
    );
  };

  module.getVisualizationAudio = function (id) {
    return fetch(
      `${environment.BACKEND_URL}/api/visualizations/${id}/audio`
    ).then((res) => res.json());
  };

  return module;
})();
