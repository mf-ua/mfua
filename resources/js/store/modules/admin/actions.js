import Vue from 'vue';
import i18n from '../../../i18n';

export const actions = {

    /**
     * Delete an image and its records
     */
    async ADMIN_DELETE_IMAGE (context)
    {
        await axios.post('/admin/destroy', {
            photoId: context.state.photo.id
        })
        .then(response => {
            console.log('admin_delete_image', response);

            context.dispatch('GET_NEXT_ADMIN_PHOTO');
        })
        .catch(error => {
            console.log(error);
        });
    },

    /**
     * Reset the tags + verification on an image
     */
    async ADMIN_RESET_TAGS (context)
    {
        const title = i18n.t('notifications.success');
        const body = 'Image has been reset';

        await axios.post('/admin/incorrect', {
            photoId: context.state.photo.id
        })
        .then(response => {
            console.log('admin_reset_tags', response);

            if (response.data.success)
            {
                Vue.$vToastify.success({
                    title,
                    body,
                    position: 'top-right'
                });

                context.dispatch('GET_NEXT_ADMIN_PHOTO');
            }

        }).catch(error => {
            console.log(error);
        });
    },

    /**
     * Verify the image as correct (stage 2)
     */
    async ADMIN_VERIFY_CORRECT (context, payload)
    {
        await axios.post('/admin/verifykeepimage', {
            photoId: context.state.photo.id,
            publicFriendly: payload
        })
        .then(resp => {
            console.log('admin_verifiy_correct', resp);

            context.dispatch('GET_NEXT_ADMIN_PHOTO');
        })
        .catch(err => {
            console.error(err);
        });
    },

    /**
     * Verify tags and delete the image
     */
    async ADMIN_VERIFY_DELETE (context)
    {
        await axios.post('/admin/contentsupdatedelete', {
            photoId: context.state.photo.id,
            // categories: categories todo
        }).then(response => {
            console.log('admin_verify_delete', response);

            context.dispatch('GET_NEXT_ADMIN_PHOTO');
        }).catch(error => {
            console.log(error);
        });
    },

    /**
     * Verify the image, and update with new tags
     */
    async ADMIN_UPDATE_WITH_NEW_TAGS (context, payload)
    {
        let photoId = context.state.photo.id;

        await axios.post('/admin/update-tags', {
            photoId: photoId,
            tags: context.rootState.litter.tags[photoId],
            custom_tags: context.rootState.litter.customTags[photoId],
            publicFriendly: payload
        })
        .then(response => {
            console.log('admin_verify_keep', response);

            context.dispatch('GET_NEXT_ADMIN_PHOTO');
        })
        .catch(error => {
            console.log(error);
        });
    },

    /**
     * Get the next photo to verify on admin account
     */
    async GET_NEXT_ADMIN_PHOTO (context)
    {
        // clear previous input on litter.js
        context.commit('resetLitter');
        context.commit('clearTags');

        await axios.get('/admin/get-image', {
            params: {
                country_id: context.state.filterByCountry,
                skip: context.state.skippedPhotos
            }
        })
            .then(resp => {
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });

                console.log('get_next_admin_photo', resp);

                // init photo data (admin.js)
                context.commit('initAdminPhoto', resp.data.photo);

                // init litter data for verification (litter.js)
                if (resp.data.photo?.verification > 0)
                {
                    context.commit('initAdminItems', resp.data.photo);
                    context.commit('initAdminCustomTags', resp.data.photo);
                }

                context.commit('initAdminMetadata', {
                    not_processed: resp.data.photosNotProcessed,
                    awaiting_verification: resp.data.photosAwaitingVerification
                });

                context.dispatch('ADMIN_GET_COUNTRIES_WITH_PHOTOS');
            })
            .catch(err => {
                console.error(err);
            });
    },

    /**
     * Get list of countries that contain photos for verification
     */
    async ADMIN_GET_COUNTRIES_WITH_PHOTOS (context)
    {
        await axios.get('/admin/get-countries-with-photos')
            .then(resp => {
                console.log('admin_get_countries_with_photos', resp);

                context.commit('setCountriesWithPhotos', resp.data);
            })
            .catch(err => {
                console.error(err);
            });
    },

    /**
     * Get the clusters that are not public friendly for admin only
     *
     * Includes backend middleware checl
     */
    async ADMIN_GET_CLUSTERS (context, payload)
    {
        await axios.get('/admin/global/clusters', {
            params: {
                zoom: payload.zoom,
                year: payload.year,
                bbox: null
            }
        })
        .then(response => {
            console.log('admin_get_clusters', response);

            context.commit('updateGlobalAdminClusters', response.data);
        })
        .catch(error => {
            console.error('admin_get_clusters', error);
        });
    }
};
