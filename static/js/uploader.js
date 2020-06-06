'use strict';
var Uploader = {};
(() => {
    const componentName = 'uploader';
    const template = `
    <div id='${componentName}-root'>
        <i style="font-size:13px">Upload a zip file containing a csv with your data and all stimuli-images. Do not use folders within the zipped file.</i><br> <br>
        <div id="upload-inputs">
            <input type='file' accept=".zip" @change="previewFiles">
            <div v-if="uploading" class="loader"></div>
            <button @click='addStimuli()' class='btn btn-info' :disabled="uploading">Add to database</button>
        </div>
   </div>`;

    Uploader = Vue.component(componentName, {
        data: function() {
            return {
                form: null,
                uploading: false
            };
        },
        methods: {
            addStimuli: function() {
                console.log('File uploading');
                this.uploading = true;
                $.ajax({ type: "POST", url: '/uploadzip', data: this.form, processData: false, contentType: false })
                    .then(response => {
                        alert(`Zip uploaded successfully!`);
                        app.showDatasets();
                        this.uploading = false;
                    })
                    .catch(e => {
                        console.log(e);
                        this.uploading = false;
                    });
            },
            previewFiles(event) {
                let file = (event.target.files[0]);
                let data = new FormData();
                data.append('uploaded_zip', file);
                this.form = data;
            }
        },
        template
    });
})();
