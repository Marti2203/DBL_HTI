'use strict';
var Compound = {};
(() => {
      const componentName = "compound";
      const template = `
      <div id="${componentName}-root">
        <link rel="stylesheet" type="text/css" href="static/css/compound.css">
        <div class="border border-secondary block-text">
            <h3>Compound Visualization</h3>
            <p>
                Compound Visualization.
            </p>
        </div>
        <div id="${componentName}-body" style='background-size:contain;' width='0' height='0'>
            <heatmap ref="heatmapInstance" class="visualization"></heatmap>
            <gaze-plot ref="gaze-plotInstance" class="visualization"></gaze-plot>
            <gaze-stripes ref="gaze-stripesInstance" class="visualization"></gaze-stripes>
            <scatter-plot ref="scatter-plotInstance" class="visualization"></scatter-plot>
        </div>
      </div>`;

      Compound = Vue.component(componentName, {
          /*mounted: function() {
              return{
                  this.configureHeatmap();
              };
          },*/

          data: function() {
              return{
                  test: true,
              };
          },

          methods: {
              configureHeatmap: function() {
                  this.heatmapInstance.heatmap.configure({width: 400, height: 400});
              },
          },


          template
      });
})();
