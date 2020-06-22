var Paginator = (() => {
    const componentName = 'paginator';
    const template = `
    <div id='${componentName}-root'>
        CurrentPage {{currentPageGetter()}}</br>
        <button class="btn btn-info" @click="nextPage" :disabled="isLastPage">+</button> 
        <button class="btn btn-info" @click="previousPage" :disabled="isFirstPage">-</button>
   </div>`;

    return Vue.component(componentName, {
        created: function() {
            this.$emit('created', this);
        },
        data: function() {
            return {
                currentPageGetter: () => 0,
                lastPageGetter: () => 0
            };
        },
        computed: {
            isFirstPage: function() {
                return this.currentPageGetter() == 0;
            },
            isLastPage: function() {
                return this.currentPageGetter() == this.lastPageGetter();
            }
        },
        methods: {
            nextPage: function() {
                if (this.isLastPage)
                    return;
                this.$emit('next-page');
            },
            previousPage: function() {
                if (this.isFirstPage)
                    return;
                this.$emit('previous-page');
            }
        },
        template
    });


})();