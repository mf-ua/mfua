<template>
	<div :class="checkOpen">
	  	<div class="dropdown-trigger" @click.stop="toggleOpen" >
	    	<button class="button is-small" aria-haspopup="true">
	      		<!-- Current Language -->
      			<img :src="getFlag(this.$i18n.locale)" class="lang-flag-small" />
				<p>{{ this.currentLang }}</p>
			</button>
	  	</div>

		<div class="dropdown-menu">
	    	<div class="dropdown-content" style="padding: 0;">
	      		<div v-for="lang in langs" @click="changeLanguage(lang.url)" class="dropdown-item hoverable flex p1em">
	      			<img :src="getFlag(lang.url)" class="lang-flag" />
	      			<p>{{ getLang(lang.url) }}</p>
	      		</div>
			</div>
	  	</div>
	</div>
</template>

<script>
export default {
	name: 'Languages',
	data () {
		return {
			button: 'dropdown navbar-item pointer',
			dir: '/assets/icons/flags/',
			langs: [
				{ url: 'en' }, // We have these languages mostly done but they are in php code with the old keys
				{ url: 'ua' },
			]
		};
	},
	computed: {
		/**
		 * Todo - change where langsOpen lives
         * We need it on vuex to close it whenever we click outside of this component
         * Todo - close when click outside of this component
		 */
		checkOpen ()
		{
			return this.$store.state.globalmap.langsOpen
                ? this.button + ' is-active'
                : this.button;
		},

        /**
         *
         */
        currentLang ()
        {
            return this.$t('locations.countries.' + this.$i18n.locale + '.lang');
        },

		/**
		 * Current locale @en
		 */
		locale ()
		{
			return this.$i18n.locale;
		}
	},
	methods: {
        /**
         * Change the currently active language
         */
        changeLanguage (lang)
        {
            this.$i18n.locale = lang;

            this.$localStorage.set('lang', lang);

            this.$store.commit('closeLangsButton');
        },

		/**
		 * Return filepath for country flag
		 */
		getFlag (lang)
		{
			if (lang === 'en') return this.dir + 'gb.png'; // english
			if (lang === 'ua') return this.dir + 'ua.png'; // ukrainian

			return this.dir + lang.toLowerCase() + '.png';
		},

		/**
		 * Return translated country string
		 */
		getLang (lang)
		{
			return this.$t('locations.countries.' + lang + '.lang');
		},

		/**
		 *
		 */
		toggleOpen ()
		{
		    this.$store.commit('closeDatesButton');
		    this.$store.commit('toggleLangsButton');
		}
	}
}
</script>

<style lang="scss">

	.flex {
		display: flex;
	}

	.hoverable {
		cursor: pointer;
	}

	.hoverable:hover {
		background-color: whitesmoke;
	}

	.p1em {
		padding: 1em;
	}

	.lang-flag {
		margin-right: 1em;
        width: 36px;
        height: 20px;
	}

	.lang-flag-small {
		max-height: 1em !important;
		margin-right: 0.5em;
        width: 20px;
        height: 16px;
    }
</style>
