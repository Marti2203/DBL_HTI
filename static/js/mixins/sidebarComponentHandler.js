var SidebarComponentHandler = {
    data: function() {
        return {
            customComponentListeners: [],
        };
    },

    destroyed: function() {
        this.customComponentListeners.forEach(obj => obj.component.$off(obj.event, obj.handler));
        this.customComponentListeners = [];
    },
};