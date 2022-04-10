<template>
    <div>

        <div class="has-background-grey-light has-text-centered py-2 admin-filters">
            <p class="has-text-weight-bold">Filter photos by:</p>

            <div class="control ml-4">
                <div class="select">
                    <select
                        v-model="selectedCountry"
                        @change="filterByCountry"
                    >
                        <option value="">All Countries</option>
                        <option
                            v-for="country in countriesWithPhotos"
                            :key="country.id"
                            :value="country.id"
                        >{{ country.country }} ({{ country.total }})</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="container is-fluid mt3">

            <loading
                v-if="loading"
                :active.sync="loading"
                :is-full-page="true"
            />

            <div v-else>

                <!-- Todo , add extra loaded statement here -->
                <div v-if="this.photosAwaitingVerification === 0 && this.photosNotProcessed === 0">
                    <p class="title is-3">All done.</p>
                </div>

                <div v-else-if="!photo">
                    <p class="title is-3">All photos for your selection are done.</p>
                    <p class="subtitle is-5">You can refresh the page to view skipped photos.</p>
                </div>

                <div v-else>
                    <div class="columns">

                        <!-- Left - remaining verification & other actions -->
                        <div class="column has-text-centered">
                            <p class="subtitle is-5">Uploaded, not tagged: {{ this.photosNotProcessed }}</p>
                            <p class="subtitle is-5">Tagged, awaiting verification: {{ this.photosAwaitingVerification }}</p>

                            <div class="mt-5">
                                <button :class="delete_verify_button" @click="verifyDelete" :disabled="processing">
                                    <span class="tooltip-text is-size-6">Accept data, verify, but delete the image.</span>
                                    Verify & Delete
                                </button>

                                <button :class="delete_button" @click="adminDelete" :disabled="processing">
                                    <span class="tooltip-text is-size-6">Delete the image.</span>
                                    DELETE
                                </button>
                            </div>

                            <div v-if="hasRecentTags" class="recent-tags control has-text-centered has-background-light px-4 py-4">
                                <RecentTags class="mb-5" :photo-id="photo.id" />
                            </div>
                        </div>

                        <!-- Middle - image -->
                        <div class="column is-half" style="text-align: center;">
                            <h1 class="title is-2 has-text-centered">
                                #{{ parseInt(this.photo.id).toLocaleString() }} Uploaded {{ this.uploadedTime }}
                            </h1>
                            <!-- todo - verification bar -->

                            <p class="subtitle is-5 has-text-centered mb-8">
                                {{ this.photo.display_name }}
                            </p>

                            <img v-img="{sourceButton: true}" class="verify-image" :src="this.photo.filename" />

                            <div class="has-text-centered mb1">
                                <button
                                    :class="verify_correct_button"
                                    :disabled="processing"
                                    @click="verifyCorrect"
                                >Accept Original Tags</button>

                                <button
                                    class="button is-large is-danger"
                                    :disabled="processing"
                                    @click="incorrect"
                                >False</button>
                            </div>

                            <!-- Add / edit tags -->
                            <div class="columns">
                                <div class="column is-two-thirds is-offset-2">
                                    <add-tags
                                        :admin="true"
                                        :id="photo.id"
                                    />
                                </div>
                            </div>

                            <div style="padding-top: 1em; text-align: center;">
                                <button :class="update_new_tags_button" @click="updateNewTags" :disabled="checkUpdateTagsDisabled">
                                    <span class="tooltip-text is-size-6">Update the image and save the new data.</span>
                                    Update with new tags
                                </button>

                                <button class="button is-large is-info tooltip mb-1" @click="skipPhoto" :disabled="processing">
                                    <span class="tooltip-text is-size-6">Skip this photo and verify the next one.</span>
                                    Skip
                                </button>
                            </div>
                        </div>

                        <!-- Right - Tags -->
                        <div class="column has-text-centered" style="position: relative;">

                            <div class="flex mb1">
                                <p class="category flex-1" style="font-size: 1.25em; text-align: left;">Public Friendly</p>

                                <label class="switch">
                                    <input type="checkbox" :checked="publicFriendly" @change="togglePublicFriendly">
                                    <span class="slider round"></span>
                                </label>
                            </div>

                            <!-- The list of tags associated with this image-->
                            <Tags
                                :photo-id="photo.id"
                                :admin="true"
                            />

                            <div style="padding-top: 3em;">
                                <button class="button is-medium is-dark tooltip" @click="clearTags">
                                    <span class="tooltip-text is-size-6">To undo this, just refresh the page.</span>
                                    Clear user input
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import moment from 'moment'

import AddTags from '../../components/Litter/AddTags'
import Tags from '../../components/Litter/Tags'
import RecentTags from '../../components/Litter/RecentTags';

export default {
	name: 'VerifyPhotos',
	components: {
        Loading,
        AddTags,
        Tags,
        RecentTags
    },
	async created ()
	{
        this.loading = true;

        await this.$store.dispatch('GET_NEXT_ADMIN_PHOTO');

        this.loading = false;
	},
	data () {
		return {
			loading: true,
			processing: false,
			btn: 'button is-large is-success',
			// button classes
			deleteButton: 'button is-large is-danger mb1 tooltip',
			deleteVerify: 'button is-large is-warning mb1 tooltip',
			verifyClass: 'button is-large is-success mb1 tooltip',
            selectedCountry: '',
            publicFriendly: false
		};
	},
	computed: {
		/**
		 * Return true to disable when processing or if no new tags exist
		 */
		checkUpdateTagsDisabled ()
		{
			if (this.processing || this.$store.state.litter.hasAddedNewTag === false) return true;

			return false;
		},

		/**
		 *
		 */
		delete_button ()
		{
			return this.processing ? this.deleteButton + ' is-loading' : this.deleteButton;
		},

		/**
		 *
		 */
		delete_verify_button ()
		{
			return this.processing ? this.deleteVerify + ' is-loading' : this.deleteVerify;
		},

        /**
         * The photo we are verifying
         */
        photo ()
        {
            return this.$store.state.admin.photo;
        },

        /**
         * Total number of photos that are uploaded and not tagged
         */
        photosNotProcessed ()
        {
            return this.$store.state.admin.not_processed;
        },

        /**
         * Total number of photos that are waiting to be verified
         */
        photosAwaitingVerification ()
        {
            return this.$store.state.admin.awaiting_verification;
        },

        /**
         * List of countries that contain unverified photos
         */
        countriesWithPhotos ()
        {
            return this.$store.state.admin.countriesWithPhotos;
        },

		/**
		 *
		 */
		update_new_tags_button ()
		{
			return this.processing ? this.verifyClass + ' is-loading' : this.verifyClass;
		},

        /**
         *
         */
        uploadedTime ()
        {
            return moment(this.photo.created_at).format('LLL');
        },

		/**
		 *
		 */
		verify_correct_button ()
		{
			return this.processing ? this.btn + ' is-loading' : this.btn;
		},

        /**
         * Return true and show Clear Recent Tags button if the user has recent tags
         */
        hasRecentTags ()
        {
            return Object.keys(this.$store.state.litter.recentTags).length > 0;
        },
	},
	methods: {

		/**
		 * Delete the image and its records
		 */
		async adminDelete (id)
		{
			this.processing = true;

			await this.$store.dispatch('ADMIN_DELETE_IMAGE');

    		this.processing = false;
		},

		/**
		 * Reset the tags the user has submitted
		 */
		clearTags ()
		{
			this.$store.commit('setAllTagsToZero', this.photo.id);
		},

		/**
		 * Send the image back to the use
		 */
  		async incorrect ()
  		{
			this.processing = true;

			await this.$store.dispatch('ADMIN_RESET_TAGS');

			this.processing = false;
        },

		/**
		 * The users tags were correct !
		 */
		async verifyCorrect ()
		{
			this.processing = true;

			await this.$store.dispatch('ADMIN_VERIFY_CORRECT', this.publicFriendly);

			this.processing = false;
		},

		// Verify an updated image and delete the image
		async verifyDelete ()
		{
			this.processing = true;

    		await this.$store.dispatch('ADMIN_VERIFY_DELETE');

    		this.processing = false;
  		},

		/**
		 * Update the data and keep the image
		 */
		async updateNewTags ()
		{
			this.processing = true;

            await this.$store.dispatch('ADMIN_UPDATE_WITH_NEW_TAGS', this.publicFriendly);

            this.processing = false;
  		},

        /**
         * Filters the photos by country
         */
        async filterByCountry ()
        {
            this.loading = true;

            this.$store.commit('setFilterByCountry', this.selectedCountry);

            await this.$store.dispatch('GET_NEXT_ADMIN_PHOTO');

            this.loading = false;
        },

        /**
         * Skips the current photo
         * and loads the next
         */
        async skipPhoto ()
        {
            this.loading = true;

            this.$store.commit('setSkippedPhotos', this.$store.state.admin.skippedPhotos + 1);

            await this.$store.dispatch('GET_NEXT_ADMIN_PHOTO');

            this.loading = false;
        },

        /**
         * Make this image public friendly or not
         */
        togglePublicFriendly () {
            this.publicFriendly = !this.publicFriendly;
        }
	}
}
</script>

<style scoped>

    .verify-image {
        max-height: 230px;
    }

    .strong {
        font-weight: 600;
    }

    .admin-filters {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .recent-tags {
        border-radius: 8px;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 25px;
        align-self: center;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #f14668;
        -webkit-transition: .4s;
        transition: .4s;
        border-radius: 34px;
    }

    .slider:before {
        position: absolute;
        content: "";
        border-radius: 50%;
        height: 18px;
        width: 18px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input:checked + .slider {
        background-color: #00d1b2;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #00d1b2;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(24px);
        -ms-transform: translateX(24px);
        transform: translateX(24px);
    }

</style>
