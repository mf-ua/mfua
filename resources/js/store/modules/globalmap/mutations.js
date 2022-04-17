import { init } from './init'

export const mutations = {

    /**
     *
     */
	closeDatesButton (state)
    {
		state.datesOpen = false;
	},

    /**
     *
     */
	closeLangsButton (state)
    {
		state.langsOpen = false;
	},

    /**
     * Initialise the global art data
     */
    globalArtData (state, payload)
    {
        state.artData = payload;
    },

    /**
     * When changing dates
     */
	globalLoading (state, payload)
    {
		state.loading = payload;
	},

    /**
     * Reset the state, when the user logs out.
     */
    resetState (state)
    {
        Object.assign(state, init);
    },

    /**
     *
     */
	toggleLangsButton (state)
    {
		state.langsOpen = ! state.langsOpen;
	},

    /**
     *
     */
	toggleGlobalDates (state)
    {
		state.datesOpen = ! state.datesOpen;
	},

	// updateCurrentGlobalDate (state, payload)
    // {
	// 	state.currentDate = payload;
	// },

    /**
     * Public friendly clusters
     */
	updateGlobalData (state, payload)
    {
		state.publicGeojson = payload;
	},

    /**
     * Admin clusters (non public friendly)
     */
    updateGlobalAdminClusters (state, payload)
    {
        state.adminGeojson = payload;
    }

};
