var BackgroundTogglerMixin = {
    data: function() {
        return {
            backgroundImageURL: '',
        };
    },
    mounted: function() {
        this.$root.requestSidebarComponent(BackgroundToggler, "backgroundToggler", async(toggler) => {
            bind(toggler, 'hide-background', () => this.hideBackground(), this.customComponentListeners);
            bind(toggler, 'show-background', () => this.showBackground(), this.customComponentListeners);
            toggler.isBackgroundVisible = true;
        }, () => this.$root.hasDatasetSelected);
    },
    computed: {
        svg: function() {
            let res = d3.select(`#${this.componentName}-svg`);
            let zoom = d3.zoom().scaleExtent([1, 50]).on('zoom', () => {
                const width = res.attr('width');
                const height = res.attr('height');
                let transform = d3.event.transform;
                transform.x = Math.min(0, Math.max(transform.x, width - width * transform.k));
                transform.y = Math.min(0, Math.max(transform.y, height - height * transform.k));
                this.g.attr('transform', transform.toString());
            });
            this.g.call(zoom);
            return res;
        },
        g: function() { return d3.select(`#${this.componentName}-graphics`); },
        image: function() { return d3.select(`#${this.componentName}-image`); },
        imageListeners: function() {
            return [this.svg, this.image];
        },
    },
    methods: {
        showBackground: function() {
            this.image.attr('href', this.backgroundImageURL);
        },
        hideBackground: function() {
            this.image.attr('href', '');
        },
        imageLoaded: function(img) {

        },
        changeStimuliImage: function(value) {
            const url = `/uploads/stimuli/${app.datasetName}/${value}`;
            this.backgroundImageURL = url;
            let img = new Image();
            let base = this;
            img.onload = function() {
                base.imageListeners.forEach(node => {
                    node.attr("width", this.width);
                    node.attr("height", this.height);
                });
                base.imageLoaded(img);
            };
            img.src = url;
            this.image.attr('href', url);
        }
    },
};