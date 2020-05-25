'use strict';
var Uploader = {};
(() => {
    const componentName = 'uploader';
    const template = `
    <div id='${componentName}-root'>
        Upload csv with your data and all stimuli-images in one zipped file (no folders within zip). <br>
        <input type='file' accept=".zip" @change="previewFiles">
        <button @click='addStimuli()' class='btn btn-info'>Add to database</button>
   </div>`;

    Uploader = Vue.component(componentName, {
        data: function() {
            return {
                stimuli: '',
                form: null
            };
        },
        methods: {
            addStimuli: function() {
                console.log('File uploading');
                $.ajax({ type: "POST", url: '/uploadzip', data: this.form, processData: false, contentType: false }).then(response => {
                    console.log(`Zip uploaded successfully!`);
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