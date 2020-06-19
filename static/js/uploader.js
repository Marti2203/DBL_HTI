'use strict';
var Uploader = (() => {
    const componentName = 'uploader';
    const template = `
    <div id='${componentName}-root'>
        <i style="font-size:13px">Upload a zip file containing a csv with your data and all stimuli-images.</i><br> <br>
        <input type='file' accept=".zip" @change="previewFiles">
        <button @click='uploadZip()' class='btn btn-info' :disabled="uploading">Add to database</button>
        <div v-if="error">{{errorText}}</div>
        <div v-if="uploading" class="loader"></div>
   </div>`;

    return Vue.component(componentName, {
        data: function() {
            return {
                form: null,
                uploading: false,
                error: false,
                errorText: ""
            };
        },
        methods: {
            uploadZip: function() {
                this.uploading = true;
                $.ajax({ type: "POST", url: '/uploadzip', data: this.form, processData: false, contentType: false })
                    .then(() => {
                        alert(`Zip uploaded successfully!`);
                        app.loadDatasets();
                    })
                    .catch(e => {
                        console.log(e);
                        this.errorText = e.responseText;
                        this.error = true;
                        setTimeout(() => this.error = false, 10000);
                    })
                    .done(e => {
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