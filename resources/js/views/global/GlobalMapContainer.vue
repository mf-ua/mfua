<template>
    <div class="global-map-container" :style="{height: mapHeight}">

        <loading
            v-if="loading"
            :active.sync="loading"
            :is-full-page="true"
        />

        <supercluster
            v-else
        />

    </div>
</template>

<script>
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import Supercluster from './Supercluster'

export default {
    name: 'GlobalMapContainer',
    components: {
        Loading,
        Supercluster
    },
    data () {
        return {
            mapHeight: (window.outerHeight - 72)
        }
    },
    async created ()
    {
        if (this.isMobile) this.addEventListenerIfMobile();

        const year = parseInt((new URLSearchParams(window.location.search)).get('year')) || null;

        // Get public friendly clusters
        await this.$store.dispatch('GET_CLUSTERS', {
            zoom: 2,
            year: year
        });

        if (this.$store.state.user.admin) {
            // Get clusters that are not public friendly
            await this.$store.dispatch('ADMIN_GET_CLUSTERS', {
                zoom: 2,
                year: year
            });
        }

        this.$store.commit('globalLoading', false);
    },
    async destroyed ()
    {
        window.removeEventListener("resize", this.resizeHandler);
    },
    computed: {
        /**
         * Show loading when changing dates
         */
        loading ()
        {
            return this.$store.state.globalmap.loading;
        },

        /**
         * Return true if the device is mobile
         */
        isMobile ()
        {
            return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        }
    },
    methods: {
        /**
         *
         */
        addEventListenerIfMobile ()
        {
            this.mapHeight = window.innerHeight - 72 + "px";

            window.addEventListener("resize", this.resizeHandler);
        },

        /**
         * Sets the display height for mobile devices
         */
        resizeHandler ()
        {
            this.mapHeight = window.innerHeight - 72 + "px";
        }
    }
}
</script>

<style scoped>
    @import '~leaflet/dist/leaflet.css';

    .global-map-container {
        height: calc(100% - 72px);
        margin: 0;
        position: relative;
        z-index: 1;
    }
</style>
