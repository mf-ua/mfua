export const actions = {
    /**
     * Get public-friendly clusters for the map
     */
    async GET_CLUSTERS (context, payload)
    {
        await axios.get('/global/clusters', {
            params: {
                zoom: payload.zoom,
                year: payload.year,
                bbox: null
            }
        })
        .then(response => {
            console.log('get_clusters', response);

            context.commit('updateGlobalData', response.data);
        })
        .catch(error => {
            console.error('get_clusters', error);
        });
    }
}
